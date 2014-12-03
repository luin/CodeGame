module.exports = function(records) {
  var i, j, k, actions, action;

  for (i = records.length - 1; i >= 1; --i) {
    actions = records[i];
    for (j = actions.length - 1; j >= 0; --j) {
      action = actions[j];
      if (action.type === 'bullet' && action.action === 'go') {
        if (action.order === 1) {
          actions[j - 1].position = action.position;
          actions[j - 1].frame = 1;
          actions.splice(j, 1);
        }
        if (action.order === 0 && !action.frame) {
          action.frame = 0.5;
        }
      }
    }
  }

  for (i = records.length - 1; i >= 1; --i) {
    actions = records[i];
    for (j = actions.length - 1; j >= 0; --j) {
      action = actions[j];
      if (action.action === 'go') {
        if (!action.frame) { action.frame = 1; }
        var found = false;
        for (k = records[i - 1].length - 1; k >= 0; --k) {
          var prevActions = records[i - 1][k];
          if (prevActions.type === action.type &&
              prevActions.action === 'go' &&
              prevActions.objectId === action.objectId) {
            prevActions.frame = action.frame + (prevActions.frame || 1);
            prevActions.position = action.position;
            found = true;
            break;
          }
        }
        if (found) {
          actions.splice(j, 1);
        }
      }
    }
  }

  return records;
};
