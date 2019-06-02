function DEBUG(error) {
  if (window.debugStatus) {
    console.error(error.message);
  }
}

function LOG(error) {
  console.log(error.message);
}

