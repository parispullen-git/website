/* Canonical Penthouse artifact labels. Loaded after penthouse.js so the
   visible markers and their drawer headings stay aligned even if a prior
   runtime asset is served from cache. */
(function () {
  'use strict';

  var labels = [
    { room: 'penthouse-living', artifact: 'suits', title: 'The Gentlemen’s Guide to Suits' },
    { room: 'kitchen', artifact: 'hellofresh', title: 'The Gentlemen’s CookBook' },
    { room: 'kitchen', artifact: 'suit', title: 'The Wardrobe' },
    { room: 'kitchen', artifact: 'suits', title: 'The Wardrobe' }
  ];

  function apply() {
    labels.forEach(function (item) {
      var room = document.getElementById(item.room);
      if (!room) return;
      var marker = room.querySelector('[data-artifact="' + item.artifact + '"] .artifact__label');
      if (marker) marker.textContent = item.title;
      var drawer = room.querySelector('.drawer__panel[data-artifact="' + item.artifact + '"] .drawer__name');
      if (drawer) drawer.textContent = item.title;
    });
  }

  document.addEventListener('DOMContentLoaded', apply);
  window.addEventListener('load', apply);
  setTimeout(apply, 0);
}());
