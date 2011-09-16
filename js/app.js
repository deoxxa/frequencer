function SoundManager() {
  this.channels = [];
  this.idleChannels = [];
}

SoundManager.prototype.play = function(file) {
  var channel;
  if (this.idleChannels.length < 1) {
    channel = new Audio();
    channel.addEventListener("ended", function() { self.idleChannels.push(channel); });
    this.channels.push(channel);
  } else {
    channel = this.idleChannels.shift();
  }

  var self = this;
  channel.src = file;
  channel.play();
};

function Loop(bpm, tpb) {
  if (bpm === undefined) { bpm = 90; }
  if (tpb === undefined) { tpb = 16; }

  this.bpm = bpm;
  this.tpb = tpb;
  this.cur = 0;
  this.listeners = [];
  this.interval = null;

  for (var i=0;i<this.tpb;++i) {
    this.listeners[i] = [];
  }
}

Loop.prototype.on = function(tick, cb) {
  this.listeners[tick].push(cb);
};

Loop.prototype.start = function() {
  var self = this;
  this.interval = setInterval(function() {
    _.forEach(self.listeners[self.cur], function(listener) {
      listener(self.cur);
    });

    self.cur++;

    if (self.cur >= self.tpb) { self.cur = 0; }
  }, (60000/this.bpm)/(this.tpb/4));
};

Loop.prototype.stop = function() {
  clearInterval(this.interval);
  this.interval = null;
  this.cur = 0;
};

Loop.prototype.toggle = function() {
  if (this.interval === null) {
    this.start();
  } else {
    this.stop();
  }
};

function Track(file) {
  this.file = file;
}

jQuery(function() {
  var sm = new SoundManager();
  var k = new Kibo();

  var sounds = {
    "kick": "sounds/kick.wav",
    "hat": "sounds/hat.wav",
    "snare": "sounds/snare.wav",
    "block": "sounds/block.wav",
  };

  var loop = new Loop(90);

  k.down("space", function() { loop.toggle(); });

  var interface = jQuery("#interface");

  var interface_top = jQuery("<div />");
  for (var i=0;i<16;++i) {
    (function() {
      var div = jQuery("<div />");
      loop.on(i, function() {
        div.css("background-color", "#A0A0FF").animate({backgroundColor: "#FFFFFF"}, 100);
      });
      interface_top.append(div);
    })();
  }
  interface.append(interface_top);

  _.forEach(sounds, function(file, name) {
    var track = new Track(file);
    var divs = jQuery("<div />");
    for (var i=0;i<16;++i) {
      (function() {
        var checked = false;
        var div = jQuery("<div />");
        div.click(function() {
          if (checked) {
            div.css("background-color", "#FFFFFF");
            checked = false;
          } else {
            div.css("background-color", "#A0A0FF");
            checked = true;
          }
        });
        loop.on(i, function() { if (checked) { sm.play(file); } });
        divs.append(div);
      })();
    }
    interface.append(divs);
  });
});
