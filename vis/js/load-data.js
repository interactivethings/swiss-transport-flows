d3.loadData = function() {
    var data, loaded, loadedCallback, loader, notifyIfAll, toload;
    loadedCallback = null;
    toload = {};
    data = {};
    loaded = function(name, d) {
      delete toload[name];
      data[name] = d;
      return notifyIfAll();
    };
    notifyIfAll = function() {
      if ((loadedCallback != null) && d3.keys(toload).length === 0) {
        return loadedCallback(data);
      }
    };
    loader = {
      json: function(name, url) {
        toload[name] = url;
        d3.json(url, function(d) {
          return loaded(name, d);
        });
        return loader;
      },
      csv: function(name, url) {
        toload[name] = url;
        d3.csv(url, function(d) {
          return loaded(name, d);
        });
        return loader;
      },
      onload: function(callback) {
        loadedCallback = callback;
        notifyIfAll();
        return loader;
      }
    };
    return loader;
  };