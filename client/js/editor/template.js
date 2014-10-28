module.exports = [
  'var lastPosition = null',
  'function onIdle(me, enemy, game) {',
  '  if (lastPosition !== null &&',
  '      me.tank.position[0] === lastPosition[0] &&',
  '      me.tank.position[1] === lastPosition[1]) {',
  '    me.turn("left")',
  '  }',
  '  lastPosition = me.tank.position.slice()',
  '  me.go()',
  '}'
].join('\r\n');
