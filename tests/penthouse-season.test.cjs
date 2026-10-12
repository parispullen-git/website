const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const roomIds = ['penthouse-living', 'closet', 'bedroom', 'bath', 'kitchen', 'study', 'music-lounge', 'cinema', 'gym', 'barbershop'];
const source = fs.readFileSync('assets/js/penthouse-season.js', 'utf8');
const end = Date.parse('2026-11-01T04:00:00Z');

function boot(now) {
  const images = roomIds.concat('unrelated-room').map(id => {
    const attributes = { src: `original/${id}.jpg?v=keep`, srcset: `original/${id}@sm.jpg 1200w, original/${id}.jpg 2400w`, width: '2400', height: '1350' };
    return { id, attributes, closest: () => ({ id }), getAttribute: k => attributes[k] ?? null, setAttribute: (k, v) => { attributes[k] = v; }, removeAttribute: k => { delete attributes[k]; } };
  });
  const events = {};
  const timers = [];
  const context = {
    Date: { parse: Date.parse, now: () => now.value },
    window: { addEventListener: (event, callback) => { events[event] = callback; } },
    document: { body: {}, querySelectorAll: () => images, addEventListener: (event, callback) => { events[event] = callback; } },
    MutationObserver: class { constructor(callback) { events.mutation = callback; } observe() {} },
    setTimeout: (callback, delay) => { timers.push({ callback, delay }); }
  };
  vm.runInNewContext(source, context);
  return { season: context.window.PenthouseSeason, images, events, timers };
}

test('2026 dates include October 31 and end exactly at New York midnight', () => {
  const { season } = boot({ value: end });
  assert.equal(season.active(Date.parse('2026-10-12T03:59:59Z')), false);
  assert.equal(season.active(Date.parse('2026-10-12T04:00:00Z')), true);
  assert.equal(season.active(end - 1), true);
  assert.equal(season.active(end), false);
  assert.equal(season.active(Date.parse('2027-10-31T16:00:00Z')), false);
});

test('all ten rooms have existing native and mobile assets; no upscaling', () => {
  const { season, images } = boot({ value: end - 1 });
  roomIds.forEach(id => {
    const selected = season.sources(id, { src: 'original', srcset: 'original' });
    assert.match(selected.src, /^assets\/img\/halloween-2026\/room-[a-z]+\.jpg$/);
    assert.ok(fs.existsSync(selected.src));
    for (const candidate of selected.srcset.split(', ')) assert.ok(fs.existsSync(candidate.split(' ')[0]));
    assert.match(selected.srcset, /@sm\.jpg 1200w/);
    assert.ok(Number(selected.srcset.match(/ (\d+)w$/)[1]) < 2400);
  });
  assert.equal(images.at(-1).attributes.src, 'original/unrelated-room.jpg?v=keep');
});

test('an open tab restores exact original source, srcset and dimensions at expiry', () => {
  const clock = { value: end - 1 };
  const { images, timers } = boot(clock);
  assert.ok(images[0].attributes.src.includes('halloween-2026'));
  assert.equal(timers[0].delay, 1);
  clock.value = end;
  timers[0].callback();
  roomIds.forEach((id, i) => {
    assert.equal(images[i].attributes.src, `original/${id}.jpg?v=keep`);
    assert.equal(images[i].attributes.srcset, `original/${id}@sm.jpg 1200w, original/${id}.jpg 2400w`);
    assert.equal(images[i].attributes.width, '2400');
    assert.equal(images[i].attributes.height, '1350');
  });
});

test('new homepage rooms retain original sources and resume correctly after suspension', () => {
  const clock = { value: end - 1000 };
  const { season, images, events } = boot(clock);
  const img = images[0];
  img.attributes['data-original-src'] = 'original/pinned-v7.jpg?v=exact';
  img.attributes['data-original-srcset'] = 'original/pinned-v7@sm.jpg 1200w, original/pinned-v7.jpg 2400w';
  const fresh = { ...img, attributes: { ...img.attributes } };
  fresh.getAttribute = k => fresh.attributes[k] ?? null;
  fresh.setAttribute = (k, v) => { fresh.attributes[k] = v; };
  fresh.removeAttribute = k => { delete fresh.attributes[k]; };
  images.push(fresh);
  events.mutation();
  clock.value = end;
  events.visibilitychange();
  assert.equal(fresh.attributes.src, 'original/pinned-v7.jpg?v=exact');
  assert.equal(fresh.attributes.srcset, fresh.attributes['data-original-srcset']);
  const original = { src: 'original.jpg', srcset: 'original@sm.jpg 1200w' };
  assert.equal(season.sources('closet', original), original);
});
