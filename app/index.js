import clock from 'clock'
import document from 'document'
import {vibration} from 'haptics'

import * as buttons from 'buttons'
import * as views from 'views'

clock.granularity = 'seconds'
// Update current time
clock.addEventListener('tick', (evt) => {
  views.datetime(evt.date)
})

buttons.reset().addEventListener('click', (evt) => {
  console.log('reset')
  vibration.start('confirmation')
})
buttons.skip().addEventListener('click', (evt) => {
  console.log('skip')
  vibration.start('confirmation')
})
buttons.toggle().addEventListener('click', (evt) => {
  console.log('toggle')
  vibration.start('confirmation')
})
buttons.stat().addEventListener('click', (evt) => {
  console.log('stat')
  vibration.start('confirmation')
})

buttons.flag().addEventListener('click', () => {
  console.log('Flag clicked.')
  vibration.start('confirmation')
  document.getElementById('options-container').style.visibility = "visible"
  document.getElementById('flag-button').style.visibility = "hidden"
  // Close after 3 seconds
  setTimeout(() => {
    document.getElementById('options-container').style.visibility = "hidden"
    document.getElementById('flag-button').style.visibility = "visible"
    vibration.start('confirmation')
  }, 3000)
})
