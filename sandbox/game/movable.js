var Movable = module.exports = function(direction, position) {
  this.direction = direction;
  this.position = position;
  this.id = (Math.random() * 100000000 | 0).toString(16);
};

Movable.create = function(movable) {
  var clone = movable.clone();
  return new Movable(clone.direction, clone.position);
};

Movable.prototype.collided = function(movable) {
  return this.position[0] === movable.position[0] &&
         this.position[1] === movable.position[1];
};

Movable.prototype.go = function(steps) {
  if (typeof steps === 'number' && steps > 1) {
    while (steps--) {
      this.go();
    }
    return;
  }

  switch (this.direction) {
    case 'up':
      this.position[1] -= 1;
      break;
    case 'down':
      this.position[1] += 1;
      break;
    case 'left':
      this.position[0] -= 1;
      break;
    case 'right':
      this.position[0] += 1;
      break;
  }
};

Movable.prototype.turn = function(direction) {
  if (this.direction === 'left' || this.direction === 'right') {
    if (this.direction === direction) {
      this.direction = 'down';
    } else {
      this.direction = 'up';
    }
  } else if (this.direction === 'up') {
    this.direction = direction;
  } else if (direction === 'left') {
    this.direction = 'right';
  } else {
    this.direction = 'left';
  }
};

Movable.prototype.clone = function() {
  return {
    id: this.id,
    position: this.position.slice(),
    direction: this.direction
  };
};
