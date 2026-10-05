import assert from 'node:assert/strict';
import test from 'node:test';
import { build } from 'esbuild';

const bundled = await build({
  entryPoints: ['src/lib/mockSupabase.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  write: false,
});
const source = Buffer.from(bundled.outputFiles[0].text).toString('base64');
const { mockSupabase: client } = await import(`data:text/javascript;base64,${source}`);

test('demo loads the tables used by the dashboard and workflow screens', async () => {
  for (const table of ['projects', 'employees', 'purchase_orders', 'po_items', 'qa_checklists', 'qa_items', 'gate_passes']) {
    const result = await client.from(table).select('*');
    assert.equal(result.error, null);
    assert.ok(result.data.length > 0, `${table} should contain sample data`);
  }
  const pending = await client.from('purchase_orders').select('*').in('status', ['requested', 'ordered']);
  assert.ok(pending.data.every(row => ['requested', 'ordered'].includes(row.status)));
});

test('project creation and status updates are visible to later queries', async () => {
  const created = await client.from('projects').insert([{ name: 'Demo test project', status: 'planned' }]).select().single();
  assert.equal(created.data.progress, 0);
  await client.from('projects').update({ status: 'in-progress', progress: 25 }).eq('id', created.data.id);
  const updated = await client.from('projects').select('*').eq('id', created.data.id).single();
  assert.equal(updated.data.status, 'in-progress');
  assert.equal(updated.data.progress, 25);
});

test('purchase-order items update totals and are removed with their order', async () => {
  const order = await client.from('purchase_orders').insert([{ project_id: '1', status: 'requested' }]).select().single();
  assert.equal(order.data.total_amount, 0);
  await client.from('po_items').insert([
    { po_id: order.data.id, name: 'Pump', quantity: 2, unit_price: 150 },
    { po_id: order.data.id, name: 'Valve', quantity: 3, unit_price: 20 },
  ]);
  const updated = await client.from('purchase_orders').select('*').eq('id', order.data.id).single();
  assert.equal(updated.data.total_amount, 360);
  await client.from('purchase_orders').delete().eq('id', order.data.id);
  const items = await client.from('po_items').select('*').eq('po_id', order.data.id);
  assert.equal(items.data.length, 0);
});

test('QA item status can be updated and child items follow checklist deletion', async () => {
  const checklist = await client.from('qa_checklists').insert([{ name: 'Demo checklist', template: false }]).select().single();
  const item = await client.from('qa_items').insert([{ checklist_id: checklist.data.id, description: 'Inspect equipment', status: 'pending' }]).select().single();
  assert.deepEqual(item.data.photo_urls, []);
  await client.from('qa_items').update({ status: 'passed' }).eq('id', item.data.id);
  const updated = await client.from('qa_items').select('*').eq('id', item.data.id).single();
  assert.equal(updated.data.status, 'passed');
  await client.from('qa_checklists').delete().eq('id', checklist.data.id);
  const remaining = await client.from('qa_items').select('*').eq('checklist_id', checklist.data.id);
  assert.equal(remaining.data.length, 0);
});

test('gate-pass checkout changes the displayed state', async () => {
  const pass = await client.from('gate_passes').insert([{ visitor_name: 'Demo visitor', status: 'active' }]).select().single();
  await client.from('gate_passes').update({ status: 'completed', check_out: new Date().toISOString() }).eq('id', pass.data.id);
  const result = await client.from('gate_passes').select('*').eq('id', pass.data.id).single();
  assert.equal(result.data.status, 'completed');
  assert.ok(result.data.check_out);
});
