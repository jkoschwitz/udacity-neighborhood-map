/*
  Handles any helper functions
*/

const Splash = window.Splash;

const DIMS = {
  'height': $(window).height(),
  'width': $(window).width()
};

function nonceString(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
  return text;
}

function stopLoading() {
  if (Splash.isRunning) {
    Splash.destroy();
  }
}
