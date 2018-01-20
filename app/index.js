import clock from 'clock'
import {vibration} from 'haptics'
import {display} from 'display'
import * as buttons from 'buttons'
import * as views from 'views'
import {PomodoroTimer} from 'pomodoro'
import {CONFIG} from 'config'

// Creating PomodoroTimer instance
console.log('Create new PomodoroTimer.')
let pomo = new PomodoroTimer(CONFIG.pomodoroSettings)
console.log('Adding notification handler to PomodoroTimer.')
pomo.onnotify = () => {
  console.log('NOTIFY!!!')
  vibration.start('nudge')
  display.on = true
}

clock.granularity = 'seconds'
// Update current time
clock.addEventListener('tick', (evt) => {
  views.datetime(evt.date)
})
// Update Pomodoro view
clock.addEventListener('tick', (evt) => {
  pomo.update(evt.date)
  views.pomodoro(pomo)
})

buttons.reset().addEventListener('click', (evt) => {
  console.log('reset')
  vibration.start('confirmation')
  views.hideOptionsMenu()

  console.log('Reset. Create new PomodoroTimer.')
  pomo.reset() // This is required to clear the notify timer
  pomo = new PomodoroTimer(CONFIG.pomodoroSettings)
  console.log('Adding notification handler to PomodoroTimer.')
  pomo.onnotify = () => {
    console.log('NOTIFY!!!')
    vibration.start('nudge')
    display.on = true
  }
  views.pomodoro(pomo)
})

buttons.skip().addEventListener('click', (evt) => {
  console.log('skip')
  vibration.start('confirmation')
  views.hideOptionsMenu()

  pomo.skip()
  pomo.update()
  views.pomodoro(pomo)
})

buttons.toggle().addEventListener('click', (evt) => {
  console.log('toggle')
  vibration.start('confirmation')
  pomo.toggle()
  pomo.update()
  views.pomodoro(pomo)
})

buttons.stat().addEventListener('click', (evt) => {
  console.log('stat. Do nothing right now.')
  vibration.start('confirmation')
})

buttons.flag().addEventListener('click', () => {
  console.log('flag.')
  vibration.start('confirmation')
  views.showOptionsMenu()
  // Close after 3 seconds
  setTimeout(() => {
    views.hideOptionsMenu()
  }, 3000)
})
