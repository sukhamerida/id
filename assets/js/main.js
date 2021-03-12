'use strict'

import '@ryangjchandler/spruce'
import 'alpinejs'

import {privacyState} from './privacyAlert'

window.addEventListener('load', () => {
  firebase.initializeApp({
    apiKey: 'AIzaSyAVxgOY5HNz3_9kOPDKePZsQFjw5olvAx4',
    authDomain: 'citric-replica-306200.firebaseapp.com',
  })

  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      Spruce.store('app').user = {
        active: true,
        email: user.email,
        emailVerified: user.emailVerified,
      }
    } else {
      Spruce.store('app').user = {
        active: false,
        email: '',
        emailVerified: false,
      }
    }
  })
})

{
  const url = new URL(window.location.href)
  const action = url.searchParams.get('action')

  Spruce.persistUsing(window.sessionStorage)

  Spruce.store('app', {
    action: action || '',

    user: {
      active: false,
      email: '',
      emailVerified: false,
    },
  }, true)
}

function homeState() {
  return {
    notification: notificationState(),
    logingOut: false,
    verifiying: false,

    logout() {
      this.logingOut = true

      firebase.auth().signOut()
        .catch((err) => {
          console.log(err)
          this.notification.open(fbTranslateError(err), 'is-danger')
        })

      this.logingOut = false
    },

    verifyEmail() {
      this.verifiying = true

      firebase.auth().currentUser.sendEmailVerification()
        .then(() => {
          this.verifiying = false
          this.notification.open(hi18n('VERIFY_SUCCESS'), 'is-success')
        })
        .catch((err) => {
          this.verifiying = false
          console.log(err)
          this.notification.open(fbTranslateError(err), 'is-danger')
        })
    },
  }
}

window.homeState = homeState

function loginState() {
  return {
    done: true,
    password: '',
    notification: notificationState(),

    submit() {
      this.done = false
      const email = this.$store.app.user.email

      firebase.auth()
        .signInWithEmailAndPassword(email, this.password)
        .then(() => {
          this.done = true
          this.notification.open(hi18n('LOGIN_SUCCESS'), 'is-success')
          redirectToContinue()
        })
        .catch((err) => {
          this.done = true
          console.log(err)
          this.notification.open(fbTranslateError(err), 'is-danger')
        })
    },
  }
}

window.loginState = loginState

function newPasswordState() {
  return {
    done: true,
    password: '',
    confirmPassword: '',
    notification: notificationState(),

    submit() {
      this.done = false

      if (this.password !== this.confirmPassword) {
        this.done = true
        this.notification.open(hi18n('WRONG_PASSWORD_CONFIRM'), 'is-danger')
        return
      }

      firebase.auth()
        .currentUser.updatePassword(this.password)
        .then(async () => {
          this.done = true
          this.notification.open(hi18n('NEW_PASSWORD_SUCCESS'), 'is-success')
          redirectToContinue()
        })
        .catch((err) => {
          this.done = true
          console.log(err)
          this.notification.open(fbTranslateError(err), 'is-danger')
        })
    },
  }
}

window.newPasswordState = newPasswordState

function notificationState(open=false, message='', classes='') {
  return {
    isOpen: open,
    classes: classes,
    message: message,

    open(message=this.message, classes=this.classes) {
      this.isOpen = true
      this.classes = classes
      this.message = message
    },

    close() {
      this.isOpen = false
    },
  }
}

window.notificationState = notificationState

function recoverState() {
  return {
    done: true,
    notification: notificationState(),

    submit() {
      this.done = false
      const email = this.$store.app.user.email

      firebase.auth()
        .sendPasswordResetEmail(email)
        .then(() => {
          this.done = true
          this.notification.open(hi18n('RECOVER_SUCCESS'), 'is-success')
        })
        .catch((err) => {
          this.done = true
          console.log(err)
          this.notification.open(fbTranslateError(err), 'is-danger')
        })
    },
  }
}

window.recoverState = recoverState

function signupState() {
  return {
    done: true,
    password: '',
    confirmPassword: '',
    notification: notificationState(),

    submit() {
      this.done = false

      if (this.password !== this.confirmPassword) {
        this.done = true
        this.notification.open(hi18n('WRONG_PASSWORD_CONFIRM'), 'is-danger')
        return
      }

      const email = this.$store.app.user.email

      firebase.auth()
        .createUserWithEmailAndPassword(email, this.password)
        .then(async ({user}) => {
          await user.sendEmailVerification()
          this.done = true
          this.notification.open(hi18n('SIGNUP_SUCCESS'), 'is-success')
          redirectToContinue()
        })
        .catch((err) => {
          this.done = true
          console.log(err)
          this.notification.open(fbTranslateError(err), 'is-danger')
        })
    },
  }
}

window.signupState = signupState

// Privacy Alert

window.privacyState = privacyState

// Helpers

function fbTranslateError(err) {
  const code = err.code
    .toUpperCase()
    .replaceAll('/', '_')
    .replaceAll('-', '_')

  return hi18n(`FB_${code}`)
}

function redirectToContinue() {
  const url = new URL(window.location.href)
  const redir = url.searchParams.get('continue')

  if (!redir)
    return

  window.location.href = redir
}
