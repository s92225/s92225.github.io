import test from 'node:test';
import assert from 'node:assert/strict';
import { prizeIcon } from '../src/prize-icons.js';
import { OBJECT_CATALOG } from '../src/object-catalog.js';

test('every collectible has distinct Candy Jelly artwork',()=>{
  const kinds=Object.keys(OBJECT_CATALOG);
  const icons=kinds.map(kind=>prizeIcon(kind));
  const artwork=icons.map(icon=>icon.replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,''));
  assert.equal(new Set(artwork).size,kinds.length);
  kinds.forEach((kind,index)=>{
    assert.match(icons[index],new RegExp(`prize-icon-${kind}`));
    assert.match(icons[index],/^<svg/);
    assert.doesNotMatch(icons[index],/<text\b/i);
    assert.ok((icons[index].match(/<(path|rect|circle|ellipse|polygon|polyline|line)\b/g)||[]).length>=3,`${kind} should use layered vector artwork`);
  });
});
