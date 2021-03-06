module.exports = {

  friendlyName: 'List Torrents',

  description: 'List all Torrents from the uTorrent client.',

  cacheable: false,

  sync: false,

  inputs: {
    host: {
      example: 'localhost',
      required: true
    },
    port: {
      example: 26085,
      required: true
    },
    username: {
      example: 'admin',
      required: true
    },
    password: {
      example: '12345',
      required: true
    }

  },

  exits: {

    success: {
      variableName: 'result',
      description: 'Done.',
    },

  },

  fn: function(inputs, exits) {
    var toDateTime = function(secs) {
      var t = new Date(0); // Epoch
      t.setSeconds(secs);
      return t;
    };

    var Machine = require('machine');
    var createClient = Machine.build(require('./create-client'));
    var client = createClient({
      host: inputs.host,
      port: inputs.port,
      username: inputs.username,
      password: inputs.password,
    }).execSync();
    // console.log(client, typeof client.call, client.call);
    client.call("list", function(err, data) {
      if (err) {
        return exits.error(err);
      }
      var torrents = data.torrents;
      torrents = torrents.map(function(info) {
        return {
          hash: info[0],
          name: info[2],
          size: info[3],
          percentDone: info[4] / 1000,
          downloaded: info[5],
          eta: info[10],
          torrentUrl: info[19],
          status: info[21],
          finishedAt: info[21].indexOf("Finished") > -1 ? toDateTime(info[24]) : null,
          dlspeed: info[9],
          path: info[26].substring(0, info[26].lastIndexOf("\\")),
          paused: info[21].indexOf("Stopped") > -1 ? 1 : 0
        };
      });
      return exits.success(torrents);
    });
  },

};