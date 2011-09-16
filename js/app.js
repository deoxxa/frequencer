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
  this.listeners = {};
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

function Sound(file) {
  this.file = file;
}

function Pad(sm, sound) {
  this.sm = sm;
  this.sound = sound;
  this.enabled = false;
  this.bound = null;
}

Pad.prototype.bind = function(el) {
  var self = this;
  this.bound = el;
  el.click(function() {
    if (self.enabled) {
      el.css("background-color", "#FFFFFF");
      self.enabled = false;
    } else {
      el.css("background-color", "#A0A0A0");
      self.enabled = true;
    }
  });
};

Pad.prototype.play = function() {
  if (this.enabled) {
    this.sm.play(this.sound.file);
  }
};

Pad.prototype.toggle = function() {
  this.bound.click();
};

jQuery(function() {
  var sm = new SoundManager();
  var loop = new Loop(90, 16); // Change me!
  var k = new Kibo(); // Don't change me :(

  // Change me too!
  var sounds = {
    "kick": "sounds/kick.wav",
    "hat": "sounds/hat.wav",
    "snare": "sounds/snare.wav",
    "block": "sounds/block.wav",
  };

  var interface = jQuery("#interface");

  var interface_top = jQuery("<div />");
  for (var i=0;i<loop.tpb;++i) {
    (function() {
      var div = jQuery("<div />");
      loop.on(i, function() {
        div.css("background-color", "#A0A0A0").animate({backgroundColor: "#FFFFFF"}, 100);
      });
      interface_top.append(div);
    })();
  }
  interface.append(interface_top);

  var pads = {};
  _.forEach(sounds, function(file, name) {
    var sound = new Sound(file);
    var divs = jQuery("<div />");
    pads[name] = {};
    for (var i=0;i<loop.tpb;++i) {
      (function() {
        var pad = new Pad(sm, sound);
        pads[name][i] = pad;
        var div = jQuery("<div />");
        pad.bind(div);
        loop.on(i, function() { pad.play(); });
        divs.append(div);
      })();
    }
    interface.append(divs);
  });

  k.down("space", function() { loop.toggle(); return false; });
  k.down("z", function() { pads.kick[loop.cur].toggle(); return false; });
  k.down("x", function() { pads.snare[loop.cur].toggle(); return false; });
  k.down("n", function() { pads.hat[loop.cur].toggle(); return false; });
  k.down("m", function() { pads.block[loop.cur].toggle(); return false; });
});
