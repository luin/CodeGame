var $ = window.jQuery = require('jquery');
require('./vendor/bracket.js');
var obj = {
  "teams": [
    ["Niu Tengyu", "空缺"],
    ["Muhammad Wang", "Zihua Li"],
    ["chairuosen", "空缺"],
    ["iamct", "sumizu"],
    ["LIU Dongyuan / 柳东原", "空缺"],
    ["devange", "neelie"],
    ["Jiansen", "空缺"],
    ["wdkwdkwdk", "空缺"]
  ],
  "results": [
    [
      [3, 0],
      [3, 0],
      [3, 0],
      [3, 0],
      [3, 0],
      [2, 1],
      [3, 0],
      [3, 0]
    ],
    [
      [3, 0],
      [0, 3],
      [1, 2],
      [1, 2]
    ],
    [
      [3, 0],
      [2, 1]
    ],
    [
      [3, 0]
    ]
  ]
};
$(function() {    
  $('#tournamentResult').bracket({      
    init: obj
  });
});
