# Pomodoro

A pomodoro timer for Fitbit Ionic.

## Description

Simple to use Pomodoro timer for your Ionic!

Features:

1. Start/Pause the timer
2. Skip current interval
3. Reset the timer (When the timer is paused)
4. Notifies you when an interval finished!

Now it only has one interval setup:
- 25 mins for working interval
- 5 mins for short break interval
- 15 mins for long break interval
- Long break after 4 working intervals
- Timer finished in 12 working intervals
Customized interval setup is coming soon ;)

IMPORTANT NOTE: If the app is not running in the foreground (e.g. switching to other apps or the clock face), it will keep counting down the interval, but you will NOT receive the notification (the vibration). This is because Ionic does not allow any app be running in the background currently.
