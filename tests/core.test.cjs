const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('../core.js');

test('malformed saved preferences fall back safely', () => {
  assert.deepEqual(core.normalize(null), core.defaults());
  const result = core.normalize({scene: '<script>', duration: -10, tasks: 'invalid'});
  assert.equal(result.scene, 'sunny');
  assert.equal(result.duration, 25);
});
test('saved tasks reject malformed entries and duplicate ids', () => {
  const result = core.normalize({tasks: [{id: 'a', text: ' hello '}, {id: 'a', text: 'duplicate'}, {id: 'b', text: ''}, null]});
  assert.deepEqual(result.tasks, [{id: 'a', text: 'hello', done: false}]);
});
test('saved task length and count are bounded', () => {
  const result = core.normalize({tasks: Array.from({length: 110}, (_, i) => ({id: String(i), text: 'x'.repeat(200)}))});
  assert.equal(result.tasks.length, 100);
  assert.equal(result.tasks[0].text.length, 160);
});
test('wall-clock deadlines survive background suspension', () => {
  const running = core.toggle({deadline: null, remaining: 300000}, 1000);
  assert.equal(core.remaining(running, 301001), 0);
});
test('pause and resume preserve remaining time', () => {
  const paused = core.toggle({deadline: 301000, remaining: 300000}, 101000);
  assert.deepEqual(paused, {deadline: null, remaining: 200000});
  assert.equal(core.toggle(paused, 200000).deadline, 400000);
});
test('remaining time formats with ceiling and zero floor', () => {
  assert.equal(core.display(300000), '05:00');
  assert.equal(core.display(1), '00:01');
  assert.equal(core.display(-1), '00:00');
});
