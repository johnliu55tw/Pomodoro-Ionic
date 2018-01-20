import * as fs from 'fs'

function findNextClosest (arr, elem) {
  if (findNextClosest.lastFoundIdx > 0 &&
      elem > arr[findNextClosest.lastFoundIdx - 1] &&
      elem <= arr[findNextClosest.lastFoundIdx]) {
    return findNextClosest.lastFoundIdx
  }
  let closest = 0
  for (closest = 0; closest < arr.length; closest++) {
    if (elem < arr[closest]) {
      break
    }
  }
  if (closest === arr.length) {
    // Not found
    findNextClosest.lastFoundIdx = -1
    return -1
  } else {
    findNextClosest.lastFoundIdx = closest
    return closest
  }
}
findNextClosest.lastFoundIdx = 0

export const PomoIntvlState = {
  work: 'work',
  rest: 'rest',
  longRest: 'longRest'
}

export const PomoTimerState = {
  running: 'running',
  paused: 'paused',
  idle: 'idle'
}

export function PomodoroTimer (settings, notifyCallback) {
  /* Takes a PomodoroSetting and three callback functions for state changes as arguments. */

  /* Store timeSettings in ms */
  this.work = settings.work * 60000
  this.rest = settings.rest * 60000
  this.longRest = settings.longRest * 60000
  this.longRestAfter = settings.longRestAfter
  this.totalIntervals = settings.totalIntervals

  // Public attributes
  this.onnotify = notifyCallback

  /* Private methods */
  // Calculate interval markers
  this._getMarkers = (offsetMin = 0) => {
    // Return time markers are in ms
    let timeMarkers = []
    let stateMarkers = []
    let intvlMarkers = []
    for (var i = 1; i <= this.totalIntervals; i++) {
      if (i % this.longRestAfter !== 0) {
        if (i === 1) {  // First one of markers, add either smallest value or useless value
          timeMarkers.push(offsetMin)
          stateMarkers.push(null)
          intvlMarkers.push(0)
        }
        timeMarkers.push(timeMarkers[timeMarkers.length - 1] + this.work)
        stateMarkers.push(PomoIntvlState.work)
        timeMarkers.push(timeMarkers[timeMarkers.length - 1] + this.rest)
        stateMarkers.push(PomoIntvlState.rest)
      } else { // Time for long rest
        timeMarkers.push(timeMarkers[timeMarkers.length - 1] + this.work)
        stateMarkers.push(PomoIntvlState.work)
        timeMarkers.push(timeMarkers[timeMarkers.length - 1] + this.longRest)
        stateMarkers.push(PomoIntvlState.longRest)
      }
      // Calculating markers for done intervals count
      intvlMarkers.push(intvlMarkers[intvlMarkers.length - 1])
      intvlMarkers.push(intvlMarkers[intvlMarkers.length - 1] + 1)
    }
    return {
      length: timeMarkers.length,
      ts: timeMarkers,
      state: stateMarkers,
      intvl: intvlMarkers
    }
  }
  // Reset/Initialize internal states
  this.reset = () => {
    if (this.notifyTimerHandler) {
      clearTimeout(this.notifyTimerHandler)
    }
    this.notifyTimerHandler = null
    this.timerState = PomoTimerState.idle
    this.intvlState = PomoIntvlState.work
    this.doneIntvls = 0  // Whenever a high interval is finished, it will be increased by 1
    this.startedAt = null
    this.pausedAt = null
    this.countdown = this.work // Initialized to the time of work interval
    this.intvlMarker = null
  }
  this.reset() // Call it immediately to generate those internal states

  this._notify = () => {
    if (this.onnotify) {
      this.onnotify()
    }
    this.notifyTimerHandler = null
  }
  /* Public methods */
  this.saveToFile = (path) => {
    let storedObj = {
      settings: {
        // Restore from ms back to minutes
        work: this.work / 60000,
        rest: this.rest / 60000,
        longRest: this.longRest / 60000,
        longRestAfter: this.longRestAfter,
        totalIntervals: this.totalIntervals
      },
      internalStates: {
        notifyTimerHandler: null,
        timerState: this.timerState,
        intvlState: this.intvlState,
        doneIntvls: this.doneIntvls,
        startedAt: this.startedAt,
        pausedAt: this.pausedAt,
        countdown: this.countdown,
        intvlMarker: this.intvlMarker
      }
    }
    fs.writeFileSync(path, storedObj, 'cbor')
  }
  this.toggle = (now) => {
    if (!now) {
      now = Date.now()
    }
    switch (this.timerState) {
      case PomoTimerState.idle: // Start from idle
        this.timerState = PomoTimerState.running
        this.startedAt = now
        this.intvlMarker = this._getMarkers(this.startedAt)
        this.update(now)
        break
      case PomoTimerState.paused: // Start from paused
        this.timerState = PomoTimerState.running
        let newStartedAt = this.startedAt + now - this.pausedAt
        this.startedAt = newStartedAt
        this.intvlMarker = this._getMarkers(newStartedAt)
        this.pausedAt = null
        this.update(now)
        break
      case PomoTimerState.running: // Pause
        this.timerState = PomoTimerState.paused
        this.pausedAt = Date.now()
        clearTimeout(this.notifyTimerHandler)
        this.notifyTimerHandler = null
        break
    }
  }

  this.skip = () => {
    console.log('Skip')
    let now = Date.now()

    if (this.timerState === PomoTimerState.running) {
      let closest = findNextClosest(this.intvlMarker.ts, now)

      if (closest < 0) {
        console.log('Skip the last one, finished.')
        this.reset()
        return
      }

      if (this.notifyTimerHandler) {
        clearTimeout(this.notifyTimerHandler)
        this.notifyTimerHandler = null
      }
      let fastForward = this.intvlMarker.ts[closest] - now
      console.log('Fast forwarding ' + fastForward.toString() + ' milliseconds.')
      let newStartedAt = this.startedAt - fastForward
      this.intvlMarker = this._getMarkers(newStartedAt)
      this.startedAt = newStartedAt
      setTimeout(this.update, 1000)  // Make sure the update method is called after the skip
    } else if (this.timerState === PomoTimerState.paused) {
      let closest = findNextClosest(this.intvlMarker.ts, this.pausedAt)

      if (closest < 0) {
        console.log('Skip the last one, finished.')
        this.reset()
        return
      }

      let fastForward = this.intvlMarker.ts[closest] - this.pausedAt
      console.log('Fast forwarding pausedAt ' + fastForward.toString() + ' milliseconds.')
      this.pausedAt = this.pausedAt + fastForward
      // Start the timer!
      this.toggle()
    }
  }

  this.update = (now) => {
    if (!now) {
      now = Date.now()
    }
    if (this.timerState === PomoTimerState.running) {
      // Find closest timestamp in markers to now
      let closest = findNextClosest(this.intvlMarker.ts, now)
      if (closest > 0) {
        this.countdown = this.intvlMarker.ts[closest] - now // Update countdown value
        this.intvlState = this.intvlMarker.state[closest] // Update interval state
        this.doneIntvls = this.intvlMarker.intvl[closest]
      } else { // End
        console.log('Timer end')
        this.reset()
        return
      }
      // Setup notification
      if (!this.notifyTimerHandler) {
        // Note: When the notify() method awaked the screen and caused this
        // method got called, the current timestamp might haven't passed the
        // time that marked the interval change, so the countdown will be a very
        // small value. So we set a handler here that if the countdown is
        // smaller than 2 seconds, call update again later.
        if (this.countdown < 2000) {
          console.log('Countdown < 2 secs: ' + this.countdown.toString() + ', call later!')
          setTimeout(this.update, 2000)
        } else {
          console.log('Setup notify handler countdown for: ' + this.countdown.toString())
          this.notifyTimerHandler = setTimeout(this._notify, this.countdown)
        }
      }
    }
  }
}
PomodoroTimer.loadFromFile = (path) => {
  try {
    let stored = fs.readFileSync(path, 'cbor')
    let pomo = new PomodoroTimer(stored.settings)
    // Restore internal state
    pomo.notifyTimerHandler = stored.internalStates.notifyTimerHandler
    pomo.timerState = stored.internalStates.timerState
    pomo.intvlState = stored.internalStates.intvlState
    pomo.doneIntvls = stored.internalStates.doneIntvls
    pomo.startedAt = stored.internalStates.startedAt
    pomo.pausedAt = stored.internalStates.pausedAt
    pomo.countdown = stored.internalStates.countdown
    pomo.intvlMarker = stored.internalStates.intvlMarker
    return pomo
  } catch (e) {
    return null
  }
}
