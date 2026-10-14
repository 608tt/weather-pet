(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PetCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const SCENES = ['sunny', 'rainy', 'fish', 'night'];
  const PETS = ['cat', 'fish', 'dog'];
  const DURATIONS = [5, 25, 45];
  function defaults() {
    return {scene: 'sunny', pet: 'cat', tasks: [], duration: 25,
      focus: {deadline: null, remaining: 25 * 60 * 1000}};
  }
  function normalize(raw, now = Date.now()) {
    const state = defaults();
    if (!raw || typeof raw !== 'object') return state;
    if (SCENES.includes(raw.scene)) state.scene = raw.scene;
    if (PETS.includes(raw.pet)) state.pet = raw.pet;
    if (DURATIONS.includes(raw.duration)) state.duration = raw.duration;
    state.focus.remaining = state.duration * 60 * 1000;
    if (Array.isArray(raw.tasks)) {
      const seen = new Set();
      state.tasks = raw.tasks.filter(task => task && typeof task.id === 'string' &&
        typeof task.text === 'string' && task.text.trim() && !seen.has(task.id) &&
        (seen.add(task.id), true)).slice(0, 100).map(task => ({
          id: task.id, text: task.text.trim().slice(0, 160), done: task.done === true
        }));
    }
    const focus = raw.focus;
    if (focus && typeof focus === 'object') {
      if (Number.isFinite(focus.remaining) && focus.remaining >= 0 && focus.remaining <= 45 * 60 * 1000)
        state.focus.remaining = focus.remaining;
      if (Number.isFinite(focus.deadline) && focus.deadline > 0 && focus.deadline <= now + 45 * 60 * 1000) state.focus.deadline = focus.deadline;
    }
    return state;
  }
  function remaining(focus, now) {
    return Math.max(0, focus.deadline === null ? focus.remaining : focus.deadline - now);
  }
  function toggle(focus, now) {
    if (focus.deadline !== null) return {deadline: null, remaining: remaining(focus, now)};
    return focus.remaining > 0 ? {deadline: now + focus.remaining, remaining: focus.remaining} : focus;
  }
  function display(milliseconds) {
    const seconds = Math.ceil(Math.max(0, milliseconds) / 1000);
    return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  }
  return {defaults, normalize, remaining, toggle, display, SCENES, PETS, DURATIONS};
});
