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
