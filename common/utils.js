export function zfill (i) {
  /* Padded a number into 2 digit number string. */
  if (i < 10) {
    return '0' + i.toString()
  } else {
    return i.toString()
  }
}

export function secondsToClock (secs, mono = false) {
  /* Convert seconds to clock display string in 'HH:MM' */
  let toStr = mono ? toMonoDigits : zfill
  let minPart = Math.floor(secs / 60)
  let secPart = secs % 60
  return toStr(minPart) + ':' + toStr(secPart)
}

export function toMonoDigits (num, zfill = true) {
  /* Convert a number to a special monospace number.

  Arguments:
    num: Number to be converted.
    zfill: Fill up the returned string to 2 digits with '0' appended. Default to true.
  */
  let digits = toDigits(num, false)

  if (digits === null) {
    return zfill ? String.fromCharCode(0x10, 0x10) : String.fromCharCode(0x10)
  } else {
    if (zfill && digits.length === 1) {
      digits.unshift(0)
    }
    return String.fromCharCode.apply(null, digits.map((v) => v + 0x10))
  }
}

export function toDigits (num, fromLsb = true) {
  /* Convert a number into array of digits. If the number is zero, return null.
  Argumenst:
    num: Number to be destructed.
    fromLsb: How the digits ordered in the returned array. Default to true.
      For example, if it's true, number 137 will return [7, 3, 1].
      If it's false, number 137 will return [1, 3, 7]
  */
  let addMethod = fromLsb ? Array.prototype.push : Array.prototype.unshift

  if (num === 0) {
    return null
  }
  let ret = []
  while (num !== 0) {
    addMethod.call(ret, (num % 10))
    num = Math.floor(num / 10)
  }
  return ret
}

export function assignLongPressEventListener (elem, handler) {
  /* Assign a handler function for long press event. If a handler funciton
    has already been assigned to the element, it will be REPLACED by this
    function. That's why it's called 'assign', not 'add'.

  NOTE: If an element ever used this function, the handler functions for
    handling the short press event (i.e. 'click' event) must be added with
    the function 'addShortPressEventListener' in this module, or some
    weird thing might happened, e.g. a short-press event got triggered
    after a long-press event.

  TODO:
    1. Maybe I could try to fixed the aforemention problem with fixing the
      'addEventListener' and 'onclick' method of the element.
  */
  elem.longPressed = false
  elem.longPressTimer = null

  elem.addEventListener('mousedown', function (evt) {
    elem.longPressed = false
    elem.longPressTimer = setTimeout(() => {
      console.log('Longpress times up. Lets see')
      elem.longPressTimer = null
      elem.longPressed = true
      handler.call(elem, evt)
    }, 400)
    // XXX: 400ms is the ideal choice for a long press. Change it only if you
    // know what you are doing and have done experiments on it.
  })

  elem.addEventListener('mouseup', function (evt) {
    if (elem.longPressTimer) {
      elem.longPressed = false
      clearTimeout(elem.longPressTimer)
      elem.longPressTimer = null
    }
  })
}

export function addShortPressEventListener (elem, handler) {
  /* Add a handler function to an element's short press event, i.e 'click' event.
    If assignLongPressEventHandler is used, then this function must be used for
    adding the handler, instead of the original 'addEventListener' or 'onclick'
    method. This funciton acted like (more or less) the 'addEventListener'
    method, so you can ADD many handler functions to the click event.
  */
  var wrapper = function (evt) {
    if (!elem.longPressed) { // Triggering short press if long press event hadn't been triggered
      handler.call(elem, evt)
    }
  }
  elem.addEventListener('click', wrapper)
}
