import db from "../config/db.js";
import { cacheGet, cacheSet } from "../services/cacheService.js";

const TTL = 60; // seconds

export const getDashboardStats = async (req, res) => {
  const cacheKey = "dashboard:stats";
  const cached = cacheGet(cacheKey);
  if (cached) return res.json(cached);

  try {
    const [[assetStats]] = await db.query(`
      SELECT
        COUNT(*) AS total,
        SUM(status = 'available')  AS available,
        SUM(status = 'assigned')   AS assigned,
        SUM(status = 'maintenance') AS maintenance,
        SUM(status = 'retired')    AS retired
      FROM assets
    `);

    const [[ticketStats]] = await db.query(`
      SELECT
        COUNT(*) AS total,
        SUM(status = 'open')        AS open,
        SUM(status = 'in_progress') AS in_progress,
        SUM(status = 'resolved')    AS resolved,
        SUM(status = 'escalated')   AS escalated,
        SUM(priority = 'urgent')    AS urgent
      FROM tickets
    `);

    const [[employeeStats]] = await db.query(`
      SELECT COUNT(*) AS total FROM employees
    `);

    const [[maintenanceStats]] = await db.query(`
      SELECT
        COUNT(*) AS total,
        SUM(status = 'pending')    AS pending,
        SUM(status = 'in_progress') AS in_progress,
        SUM(status = 'completed')  AS completed,
        COALESCE(SUM(cost), 0)     AS total_cost
      FROM maintenance_logs
    `);

    const payload = {
      assets: assetStats,
      tickets: ticketStats,
      employees: employeeStats,
      maintenance: maintenanceStats,
    };

    cacheSet(cacheKey, payload, TTL);
    res.json(payload);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching dashboard stats" });
  }
};

export const getAssetStatusDistribution = async (req, res) => {
  const cacheKey = "analytics:asset-status";
  const cached = cacheGet(cacheKey);
  if (cached) return res.json(cached);

  try {
    const [rows] = await db.query(`
      SELECT status AS name, COUNT(*) AS value
      FROM assets
      GROUP BY status
      ORDER BY value DESC
    `);
    cacheSet(cacheKey, rows, TTL);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching asset distribution" });
  }
};

export const getTicketMetrics = async (req, res) => {
  const cacheKey = "analytics:ticket-metrics";
  const cached = cacheGet(cacheKey);
  if (cached) return res.json(cached);

  try {
    const [byStatus] = await db.query(`
      SELECT status AS name, COUNT(*) AS count
      FROM tickets
      GROUP BY status
    `);

    const [byPriority] = await db.query(`
      SELECT priority AS name, COUNT(*) AS count
      FROM tickets
      GROUP BY priority
      ORDER BY FIELD(priority, 'urgent', 'high', 'medium', 'low')
    `);

    const [monthly] = await db.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS count
      FROM tickets
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY month
      ORDER BY month
    `);

    const payload = { byStatus, byPriority, monthly };
    cacheSet(cacheKey, payload, TTL);
    res.json(payload);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching ticket metrics" });
  }
};

export const getEmployeesByDepartment = async (req, res) => {
  const cacheKey = "analytics:emp-by-dept";
  const cached = cacheGet(cacheKey);
  if (cached) return res.json(cached);

  try {
    const [rows] = await db.query(`
      SELECT department AS name, COUNT(*) AS value
      FROM employees
      WHERE department IS NOT NULL AND department != ''
      GROUP BY department
      ORDER BY value DESC
    `);
    cacheSet(cacheKey, rows, TTL);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching employee distribution" });
  }
};

export const getDepartmentPerformance = async (req, res) => {
  const cacheKey = "analytics:dept-perf";
  const cached = cacheGet(cacheKey);
  if (cached) return res.json(cached);

  try {
    const [rows] = await db.query(`
      SELECT
        d.name,
        COUNT(DISTINCT t.id)                                  AS tickets,
        COUNT(DISTINCT CASE WHEN t.status = 'resolved' THEN t.id END) AS resolved,
        COUNT(DISTINCT aa.id)                                 AS assignments
      FROM departments d
      LEFT JOIN tickets t      ON t.department_id = d.id
      LEFT JOIN asset_assignments aa ON aa.department = d.name
      GROUP BY d.id, d.name
      ORDER BY tickets DESC
      LIMIT 10
    `);
    cacheSet(cacheKey, rows, TTL);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching department performance" });
  }
};

export const getCustodyIntelligence = async (req, res) => {
  const cacheKey = "analytics:custody-intelligence";
  const cached = cacheGet(cacheKey);
  if (cached) return res.json(cached);

  try {
    const [rows] = await db.query(`
      SELECT
        a.id AS asset_id,
        a.name AS asset_name,
        a.asset_tag,
        a.status AS asset_status,
        c.name AS category_name,
        aa.id AS assignment_id,
        aa.department AS assigned_department,
        aa.assigned_date,
        e.id AS employee_id,
        e.name AS assigned_to,
        e.department AS employee_department,
        DATEDIFF(CURDATE(), aa.assigned_date) AS assignment_age_days,
        COALESCE(ml.total_maintenance, 0) AS maintenance_count,
        COALESCE(ml.open_maintenance, 0) AS open_maintenance_count,
        COALESCE(ml.maintenance_department_mismatches, 0) AS maintenance_mismatch_count,
        COALESCE(t.total_tickets, 0) AS ticket_count,
        COALESCE(t.ticket_department_mismatches, 0) AS ticket_mismatch_count
      FROM assets a
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN asset_assignments aa
        ON aa.asset_id = a.id
       AND aa.status = 'assigned'
       AND aa.id = (
         SELECT aa2.id
         FROM asset_assignments aa2
         WHERE aa2.asset_id = a.id AND aa2.status = 'assigned'
         ORDER BY aa2.assigned_date DESC, aa2.id DESC
         LIMIT 1
       )
      LEFT JOIN employees e ON aa.user_id = e.id
      LEFT JOIN (
        SELECT
          m.asset_id,
          COUNT(*) AS total_maintenance,
          SUM(m.status IN ('open', 'in_progress', 'reopened')) AS open_maintenance,
          SUM(
            CASE
              WHEN raiser.department IS NOT NULL
               AND raiser.department <> ''
               AND active_aa.department IS NOT NULL
               AND raiser.department <> active_aa.department
              THEN 1 ELSE 0
            END
          ) AS maintenance_department_mismatches
        FROM maintenance_logs m
        LEFT JOIN employees raiser ON m.raised_by = raiser.id
        LEFT JOIN asset_assignments active_aa
          ON active_aa.asset_id = m.asset_id
         AND active_aa.status = 'assigned'
         AND active_aa.id = (
           SELECT aa3.id
           FROM asset_assignments aa3
           WHERE aa3.asset_id = m.asset_id AND aa3.status = 'assigned'
           ORDER BY aa3.assigned_date DESC, aa3.id DESC
           LIMIT 1
         )
        WHERE m.created_at >= DATE_SUB(NOW(), INTERVAL 180 DAY)
        GROUP BY m.asset_id
      ) ml ON ml.asset_id = a.id
      LEFT JOIN (
        SELECT
          t.asset_id,
          COUNT(*) AS total_tickets,
          SUM(
            CASE
              WHEN active_aa.department IS NOT NULL
               AND (
                 (d.name IS NOT NULL AND d.name <> active_aa.department)
                 OR (reporter.department IS NOT NULL AND reporter.department <> '' AND reporter.department <> active_aa.department)
               )
              THEN 1 ELSE 0
            END
          ) AS ticket_department_mismatches
        FROM tickets t
        LEFT JOIN departments d ON t.department_id = d.id
        LEFT JOIN employees reporter ON t.reporter_id = reporter.id
        LEFT JOIN asset_assignments active_aa
          ON active_aa.asset_id = t.asset_id
         AND active_aa.status = 'assigned'
         AND active_aa.id = (
           SELECT aa4.id
           FROM asset_assignments aa4
           WHERE aa4.asset_id = t.asset_id AND aa4.status = 'assigned'
           ORDER BY aa4.assigned_date DESC, aa4.id DESC
           LIMIT 1
         )
        WHERE t.asset_id IS NOT NULL
          AND t.created_at >= DATE_SUB(NOW(), INTERVAL 180 DAY)
        GROUP BY t.asset_id
      ) t ON t.asset_id = a.id
      WHERE a.status IN ('assigned', 'maintenance') OR aa.id IS NOT NULL
      ORDER BY a.created_at DESC
    `);

    const items = rows.map((row) => {
      let risk = 0;
      const reasons = [];
      const assignmentAge = Number(row.assignment_age_days || 0);
      const maintenanceMismatches = Number(row.maintenance_mismatch_count || 0);
      const ticketMismatches = Number(row.ticket_mismatch_count || 0);
      const maintenanceCount = Number(row.maintenance_count || 0);
      const openMaintenance = Number(row.open_maintenance_count || 0);

      if (!row.assignment_id) {
        risk += 30;
        reasons.push("Asset has no active assignment record");
      }
      if (row.assigned_department && row.employee_department && row.assigned_department !== row.employee_department) {
        risk += 18;
        reasons.push("Assigned employee department differs from assignment department");
      }
      if (maintenanceMismatches > 0) {
        risk += Math.min(24, maintenanceMismatches * 12);
        reasons.push(`${maintenanceMismatches} maintenance request${maintenanceMismatches > 1 ? "s" : ""} came from another department`);
      }
      if (ticketMismatches > 0) {
        risk += Math.min(24, ticketMismatches * 10);
        reasons.push(`${ticketMismatches} linked ticket${ticketMismatches > 1 ? "s" : ""} came from another department`);
      }
      if (assignmentAge > 365) {
        risk += 20;
        reasons.push("Assignment has not been refreshed in over a year");
      } else if (assignmentAge > 180) {
        risk += 12;
        reasons.push("Assignment is older than 6 months");
      }
      if (maintenanceCount >= 4) {
        risk += 12;
        reasons.push("High maintenance activity in the last 180 days");
      }
      if (openMaintenance > 0 || row.asset_status === "maintenance") {
        risk += 8;
        reasons.push("Asset has open or active maintenance activity");
      }

      const custodyRiskScore = Math.min(100, risk);
      const custodyConfidence = Math.max(0, 100 - custodyRiskScore);
      const custodyLevel = custodyConfidence < 55 ? "high" : custodyConfidence < 78 ? "watch" : "healthy";

      return {
        ...row,
        assignment_age_days: assignmentAge,
        maintenance_count: maintenanceCount,
        open_maintenance_count: openMaintenance,
        maintenance_mismatch_count: maintenanceMismatches,
        ticket_mismatch_count: ticketMismatches,
        custody_confidence: custodyConfidence,
        custody_risk_score: custodyRiskScore,
        custody_level: custodyLevel,
        primary_reason: reasons[0] || "No custody anomalies detected",
        reasons,
        recommended_action:
          custodyLevel === "high"
            ? "Review custody and confirm reassignment"
            : custodyLevel === "watch"
              ? "Confirm usage with assigned department"
              : "No action required"
      };
    });

    const levelCounts = items.reduce((acc, item) => {
      acc[item.custody_level] = (acc[item.custody_level] || 0) + 1;
      return acc;
    }, { healthy: 0, watch: 0, high: 0 });

    const byDepartmentMap = items.reduce((acc, item) => {
      const department = item.assigned_department || "Unassigned";
      if (!acc[department]) acc[department] = { name: department, high: 0, watch: 0, healthy: 0, total: 0 };
      acc[department][item.custody_level] += 1;
      acc[department].total += 1;
      return acc;
    }, {});

    const payload = {
      summary: {
        total: items.length,
        healthy: levelCounts.healthy || 0,
        watch: levelCounts.watch || 0,
        high: levelCounts.high || 0,
        averageConfidence: items.length
          ? Math.round(items.reduce((sum, item) => sum + item.custody_confidence, 0) / items.length)
          : 100
      },
      items,
      topRiskAssets: [...items].sort((a, b) => a.custody_confidence - b.custody_confidence).slice(0, 5),
      byDepartment: Object.values(byDepartmentMap)
        .sort((a, b) => (b.high - a.high) || (b.watch - a.watch) || (b.total - a.total))
        .slice(0, 8)
    };

    cacheSet(cacheKey, payload, TTL);
    res.json(payload);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching custody intelligence" });
  }
};
