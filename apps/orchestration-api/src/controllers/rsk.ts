import { Request, Response } from 'express';
import { query } from '../db';

export const getRskQueue = async (req: Request, res: Response) => {
  const { district } = req.query;

  try {
    let sql = `
      SELECT h.*, f.name as farmer_name, f.phone_number as farmer_phone, f.village, f.district
      FROM health_cases h
      JOIN farmers f ON h.farmer_id = f.id
      WHERE h.status = 'escalated' OR h.status = 'pending'
    `;
    const params: any[] = [];
    
    if (district) {
      sql += ` AND f.district = $1`;
      params.push(district);
    }
    
    sql += ` ORDER BY 
             CASE WHEN h.severity_estimate = 'high' THEN 1 
                  WHEN h.severity_estimate = 'medium' THEN 2 
                  ELSE 3 END ASC, 
             h.created_at DESC`;

    const queueRes = await query(sql, params);
    res.json({ cases: queueRes.rows });
  } catch (error) {
    console.error('Queue fetch error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Database error' } });
  }
};

export const resolveCase = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { officer_notes, status = 'resolved' } = req.body;
  // Assumes authenticated officer ID is attached to req in a real app
  const officer_id = '00000000-0000-0000-0000-000000000000'; // mock uuid

  try {
    const updateRes = await query(`
      UPDATE health_cases
      SET status = $1, officer_notes = $2, resolved_at = now()
      WHERE id = $3
      RETURNING *
    `, [status, officer_notes, id]);

    if (updateRes.rowCount === 0) {
       return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Case not found' } });
    }

    res.json({ status: 'success', health_case: updateRes.rows[0] });
  } catch (error) {
    console.error('Resolve case error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Database error' } });
  }
};
