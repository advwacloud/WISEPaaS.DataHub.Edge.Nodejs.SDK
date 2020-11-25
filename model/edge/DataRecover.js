'use strict';
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const gzip = require('../../helpers/gZippedJson');

class DataRecover {
  constructor (nodeId) {
    this._db = null;
    this._dbPath = this._dataRecoverPath(nodeId);
    this._init();
  }

  _init () {
    try {
      if (!this._db) {
        this._db = new sqlite3.Database(this._dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, error => {
          if (error) {
            console.error('Establish database error: ' + error);
          }
        });
        this._db.serialize(() => {
          this._db.run('CREATE TABLE IF NOT EXISTS Data (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, message TEXT NOT NULL)', error => {
            if (error) {
              console.error('Create data table error: ' + error);
              throw error;
            }
          });
          this._db.exec('VACUUM');
        });
      }
    } catch (error) {
      console.error('init database function error: ' + error);
    }
  }

  dataAvailable (callback) {
    try {
      let result = false;
      if (!fs.existsSync(this._dbPath)) {
        return callback(result);
      }
      this._db.all('SELECT * FROM Data LIMIT 1', (err, res) => {
        if (err) {
          console.error(err);
          throw err;
        }
        if (res && res.length > 0) {
          result = true;
        }
        callback(result);
      });
    } catch (error) {
      let result = false;
      callback(result);
      console.error('dataAvailable function error: ' + error);
    }
  }

  read (count, callback) {
    try {
      this._db.all('SELECT * FROM Data LIMIT @Count', count, (error, row) => {
        if (error) {
          console.error(error);
          throw error;
        }
        let idList = [];
        let messageList = [];
        let resMsg = [];
        row.forEach(x => {
          idList.push(x.id);
          messageList.push(x.message);
        });
        for (let msg of messageList) {
          resMsg.push(gzip.decompressFromBase64String(msg));
        }
        if (idList.length > 0) {
          this._db.run(`DELETE FROM Data WHERE id IN (${this._queryString(idList)})`, idList, (error) => {
            if (error) console.log(error);
          });
        }
        callback(resMsg);
      });
    } catch (error) {
      console.error('Data recover read function error: ' + error);
    }
  }

  write (message) {
    try {
      this._db.serialize(() => {
        this._db.run('BEGIN');
        try {
          this._db.run('CREATE TABLE IF NOT EXISTS Data (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, message TEXT NOT NULL)', error => {
            if (error) {
              console.error('Create data table error: ' + error);
              throw error;
            }
          });
          if (Array.isArray(message)) {
            for (let msg of message) {
              this._writeMsgToDB(msg);
            }
          } else {
            this._writeMsgToDB(message);
          }
          this._db.run('COMMIT');
        } catch (error) {
          console.error('Insert database error: ', error);
          this._db.run('ROLLBACK');
        }
      });
    } catch (error) {
      console.error('Data recover write error: ', error);
      this._db.run('ROLLBACK');
    }
  }

  _queryString (idList) {
    let res = '';
    for (let i = 0; i < idList.length; i++) {
      res = res + '?';
      if (i !== idList.length - 1) {
        res = res + ',';
      }
    }
    return res;
  }

  _writeMsgToDB (msg) {
    let result = gzip.compressToBase64String(msg);
    this._db.run('INSERT INTO Data (message) VALUES (@Message)', result, error => {
      if (error) {
        console.error('Insert data to database error: ' + error);
        throw error;
      }
    });
  }

  _dataRecoverPath (nodeId) {
    let dataRecoverPath = path.resolve(process.cwd(), './' + nodeId + '_recover.sqlite.db');
    return dataRecoverPath;
  }
}

module.exports = DataRecover;
