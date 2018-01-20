import document from 'document'
import * as utils from '../common/utils.js'

export function datetime (date) {
  /* Takes a Date object to update time related views */
  timeText().text = date.getHours().toString() + ':' + date.getMinutes().toString()
}

export function pomodoro (countdown,
                          countdownTotal,
                          finishedIntvls,
                          totalIntvls,
                          color = null) {
  pomoTime().text = utils.secondsToClock(countdown, true)
  pomoSets().text = finishedIntvls.toString() + '/' + totalIntvls.toString()
  // The countdown circle
  pomoCircle.sweepAngle = (countdown / countdownTotal) * 360
  if (color) {
    pomoTime().style.fill = color
    pomoSets().style.fill = color
    pomoCircle().style.fill = color
  }
}

/* Helper functions for getting the elements */
let timeText = () => document.getElementById('stat-text')
let pomoTime = () => document.getElementById('countdown-counter')
let pomoSets = () => document.getElementById('interval-counter')
let pomoCircle = () => document.getElementById('countdown-arc')
