import document from 'document'
import * as utils from '../common/utils.js'
import {PomoIntvlState, PomoTimerState} from 'pomodoro'

export function datetime (date) {
  /* Takes a Date object to update time related views */
  timeText().text = date.getHours().toString() + ':' + date.getMinutes().toString()
}

export function pomodoro (pomoTimer) {
  pomoTime().text = utils.secondsToClock(pomoTimer.countdown / 1000, true)
  pomoSets().text = pomoTimer.doneIntvls.toString() + '/' +
                    pomoTimer.totalIntervals.toString()
  // The countdown circle
  // XXX Fixed this
  pomoCircle.sweepAngle = 360
  if (pomoTimer.timerState === PomoTimerState.running) {
    playIcon().style.visibility = 'hidden'
    pauseIcon().style.visibility = 'visible'
    let color = null
    switch (pomoTimer.intvlState) {
      case PomoIntvlState.work:
        color = 'fb-red'
        break
      case PomoIntvlState.rest:
        color = 'fb-blue'
        break
      case PomoIntvlState.longRest:
        color = 'fb-mint'
        break
    }
    pomoTime().style.fill = color
    pomoSets().style.fill = color
    pomoCircle().style.fill = color
  } else {
    playIcon().style.visibility = 'visible'
    pauseIcon().style.visibility = 'hidden'
    pomoTime().style.fill = 'gray'
    pomoSets().style.fill = 'gray'
    pomoCircle().style.fill = 'gray'
  }
}

export function showOptionsMenu () {
  optionsContainer().style.visibility = 'visible'
  flagButton().style.visibility = 'hidden'
}

export function hideOptionsMenu () {
  optionsContainer().style.visibility = 'hidden'
  flagButton().style.visibility = 'visible'
}

/* Helper functions for getting the elements */
let timeText = () => document.getElementById('stat-text')
let pomoTime = () => document.getElementById('countdown-counter')
let pomoSets = () => document.getElementById('interval-counter')
let pomoCircle = () => document.getElementById('countdown-arc')
let playIcon = () => document.getElementById('play-icon')
let pauseIcon = () => document.getElementById('pause-icon')
let optionsContainer = () => document.getElementById('options-container')
let flagButton = () => document.getElementById('flag-button')
