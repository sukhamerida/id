'use strict'

function privacyState(lsKey) {
  return {
    agreed: localStorage.getItem(lsKey) !== null,

    agree() {
      this.agreed = true
      localStorage.setItem(lsKey, 'agree')
    },
  }
}

export {
  privacyState,
}
