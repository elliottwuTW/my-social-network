// API URL
const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
const INDEX_URL = BASE_URL + '/api/v1/users/'
// DOM elements
const friendsLink = document.querySelector("#friends-link")
const friendsPage = document.querySelector("#friends-page")
const friendsAmount = document.querySelector('#friends-amount')
const favoriteLink = document.querySelector("#favorite-link")
const favoritePage = document.querySelector("#favorite-page")
const favoriteAmount = document.querySelector("#favorite-amount")

const dataPanel = document.querySelector("#data-panel")

const input = document.querySelector("#input")
const btnSearch = document.querySelector("#btn-search")

const view = document.querySelector('#view')
const grid = document.querySelector(".fa-th")
const bar = document.querySelector(".fa-bars")


// Screen mode
const viewMode = {
  GRID: 'GRID',
  BAR: 'BAR'
}
let currentMode = viewMode.GRID
const DEFAULT_VIEW = viewMode.GRID
const MOBILE_SIZE = 575           // 575px

// Web state
const state = {
  FRIENDS: 'FRIENDS',                                 // All Friends
  FRIENDS_SEARCH: 'FRIENDS_SEARCH',                   // All Friends、After search
  FRIENDS_ANOTHER_SEARCH: 'FRIENDS_ANOTHER_SEARCH',   // All Friends、Another search being in the search
  FAVORITE: 'FAVORITE',                               // Favorite
  FAVORITE_REFRESH: 'FAVORITE_REFRESH',               // Favorite、Refresh due to cancellation
  FAVORTIE_SEARCH: 'FAVORITE_SEARCH',                 // Favorite、After search
  FAVORTIE_ANOTHER_SEARCH: 'FAVORTIE_ANOTHER_SEARCH', // Favorite、Another search being in the search
  FAVORTIE_SEARCH_REFRESH: 'FAVORTIE_SEARCH_REFRESH', // Favorite、After search、Refresh due to cancellation
  VIEWMODE_CHANGE: 'VIEWMODE_CHANGE'                  // Change the screen mode
}
Object.freeze(state)

let lastState = ''
let currentState = state.FRIENDS
let tempState = ''

// User data in different web modes
const allUsers = []
let allUsers_Filtered = []
let favoriteUsers = JSON.parse(localStorage.getItem("favoriteUsers")) || []
let favoriteUsers_Filtered = []

// Parameters for different user data
const USERS_GET_AMOUNT = 10 // the amount of users got from API
let friendsStartIndex = 0
let friendsStartIndex_Filtered = 0
let favoriteStartIndex = 0
let favoriteStartIndex_Filtered = 0

axios.get(INDEX_URL)
  .then(response => {
    allUsers.push(...response.data.results)
    renderViewMode(DEFAULT_VIEW)
    renderUserListByMode(getUsersByStartIndex(allUsers, 0), DEFAULT_VIEW)
    friendsAmount.innerText = `(${allUsers.length})`
    renderFavoriteAmount()
  })

/**
 * Functions
 */
// Render the section of switching screen mode ( string -> undefined )
function renderViewMode(mode) {
  if (mode === viewMode.GRID) {
    grid.classList.add("active")
    bar.classList.remove("active")
  } else if (mode === viewMode.BAR) {
    grid.classList.remove("active")
    bar.classList.add("active")
  }
}
// Get the array from startIndex in the specific user data ( (array, number) -> array )
function getUsersByStartIndex(usersArr, startIndex) {
  return usersArr.slice(startIndex, startIndex + USERS_GET_AMOUNT)
}

// Render user list in a specific mode ( array -> undefined )
function renderUserListByMode(users, mode) {
  // console.log(`=== in the renderUserListByMode() ===`)
  // console.log('lastState: ', lastState)
  // console.log('currentState: ', currentState)
  // console.log(`======`)
  if (currentState === lastState) {
    dataPanel.innerHTML += renderedContent(users, mode)   // Continue to render 
  } else {
    dataPanel.innerHTML = renderedContent(users, mode)    // A new render
  }
  lastState = currentState
}

// Return the rendered HTML ( (array, string) -> string )
function renderedContent(users, mode) {
  if (mode === viewMode.GRID) {
    return `
      ${users.map(user =>
      `<div class="col-sm-6 col-md-4 col-lg-3 mb-2">
            <div class="card">
              <a href="#" class="grid-avatar user-info" data-id="${user.id}">
                <img class="card-img-top" src="${user.avatar}" alt="User avatar">
                <i class="fas ${user.gender === 'male' ? 'fa-mars' : 'fa-venus'} fa-2x"></i>
              </a>
              <div class="card-body">
                <h5 class="card-title">${user.name}</h5>
                <h6 class="card-subtitle mb-2 text-muted">${user.name + user.surname}</h6>
              </div>
              <div class="card-footer">
                <a hred="#" class="favorite">
                  <i class="${favoriteUsers.some(favorUser => favorUser.id === user.id) ?
        'fas' : 'far'
      } 
                    fa-heart fa-2x favorite-icon" data-id="${user.id}">
                  </i>
                </a>
                <button class="btn btn-outline-success user-info" data-id="${user.id}">Contact</button>
              </div>
            </div>
          </div> 
          `
    ).join('')
      }    
    `
  } else if (mode === viewMode.BAR) {
    if (users.length == 0) {   // no data
      return ''
    } else {
      return `
        <table class="table">
          <tbody>
            ${users.map(user => `
                        <tr class="d-flex">
                          <td class="d-flex w-50">
                            <div class="mr-3">  
                              <a href="#" class="bar-avatar user-info" data-id="${user.id}">
                                <img src="${user.avatar}" alt="User avatar">
                                <i class="fas ${user.gender === 'male' ? 'fa-mars' : 'fa-venus'} fa-2x"></i>
                              </a>
                            </div>
                            <div class="d-flex flex-column justify-content-center">
                              <h5>${user.name}</h5>
                              <h6 class="mb-2 text-muted">${user.name + user.surname}</h6>
                            </div>
                          </td>
                          <td class="d-flex justify-content-end align-items-center w-50">
                              <a hred="#" class="favorite">
                                <i class="${favoriteUsers.some(favorUser => favorUser.id === user.id) ?
          'fas' : 'far'
        } 
                                  fa-heart fa-2x favorite-icon" data-id="${user.id}">
                                </i>
                              </a>
                              <button class="btn btn-outline-success user-info" data-id="${user.id}">Contact</button>
                          </td>
                        </tr>
                        `).join('')
        }
          </tbody>
        </table>
      `
    }

  }
}

// Display the specific user modal ( number -> undefined )
async function showUserModalById(id) {
  try {
    resetUserModal()
    const response = await axios.get(INDEX_URL + id)
    renderUserModal(response.data)
  } catch (error) {
    console.error('Failure request!');
    console.error(error.response.status);
  }
}

// Reset the user modal
function resetUserModal() {
  const userTitle = document.querySelector('#user-modal-title')
  const userAvatar = document.querySelector('#user-avatar')
  const userInfo = document.querySelector('#user-info')

  userTitle.innerHTML = ''
  userAvatar.src = ''
  userInfo.innerHTML = ''
}

// Render the specific user modal ( object -> undefined )
function renderUserModal(userData) {
  const userTitle = document.querySelector('#user-modal-title')
  const userAvatar = document.querySelector('#user-avatar')
  const userInfo = document.querySelector('#user-info')

  userTitle.innerText = userData.name + ' ' + userData.surname
  userAvatar.src = userData.avatar
  userInfo.innerHTML = `
        <li><strong>Age</strong>: ${userData.age}</li>
        <li><strong>Gender</strong>: ${userData.gender}</li>
        <li><strong>Region</strong>: ${userData.region}</li>
        <li><strong>Birthday</strong>: ${userData.birthday}</li>
        <li><strong>Email</strong>: <br>${userData.email}</li>
      `
}

// Update the favorite friends data ( number -> undefined )
function updateFavoriteUser(id) {
  const targetUser = allUsers.find(user => user.id === id)

  if (!favoriteUsers) {
    favoriteUsers.push(targetUser)
  } else {
    const targetUserIndex = favoriteUsers.findIndex(user => user.id === id)
    if (targetUserIndex === -1) {
      favoriteUsers.push(targetUser)            // Add to Favorite
    } else {
      favoriteUsers.splice(targetUserIndex, 1)  // Remove from Favorite
    }
  }

  updateFavoriteLocalStorage()
}

// Update the favorite friends data after filtering ( number -> undefined )
function updateFavoriteUserFiltered(id) {
  const targetUserIndex = favoriteUsers_Filtered.findIndex(user => user.id === id)
  if (targetUserIndex !== -1) {
    favoriteUsers_Filtered.splice(targetUserIndex, 1)  // Remove from Favorite
  }
}

// Update the favorite friends in the local storage
function updateFavoriteLocalStorage() {
  localStorage.setItem('favoriteUsers', JSON.stringify(favoriteUsers))
}

// Render the amount of favorite friends
function renderFavoriteAmount() {
  favoriteAmount.innerText = `(${favoriteUsers.length})`
}

// Get the filtered results from the specific user data ( (array, string) -> array )
function getFilterResults(usersArr, searchTerm) {
  return usersArr.filter(user => {
    {
      const userName = user.name.toUpperCase()
      const userSurname = user.surname.toUpperCase()

      return userName.includes(searchTerm) || userSurname.includes(searchTerm)
    }
  })
}

// Reset web state
function resetState() {
  switch (currentState) {
    case state.FRIENDS:
      currentState = state.FRIENDS
      lastState = state.FRIENDS
      break

    case state.FRIENDS_SEARCH:
    case state.FRIENDS_ANOTHER_SEARCH:
      currentState = state.FRIENDS_SEARCH
      lastState = state.FRIENDS_SEARCH
      break

    case state.FAVORITE:
    case state.FAVORITE_REFRESH:
      currentState = state.FAVORITE
      lastState = state.FAVORITE
      break

    case state.FAVORTIE_SEARCH:
    case state.FAVORTIE_ANOTHER_SEARCH:
    case state.FAVORTIE_SEARCH_REFRESH:
      currentState = state.FAVORTIE_SEARCH
      lastState = state.FAVORTIE_SEARCH
      break

    default:
      console.error(`Undefined display state: ${currentState}`)
  }
}

// Re-render user list in the current screen mode
function reRenderUserListByViewMode() {
  tempState = currentState
  currentState = state.VIEWMODE_CHANGE  // For the purpose of starting a new render

  // Current web state
  switch (tempState) {
    case state.FRIENDS:
      renderUserListByMode(allUsers.slice(0, friendsStartIndex + USERS_GET_AMOUNT), currentMode)
      break;

    case state.FRIENDS_SEARCH:
    case state.FRIENDS_ANOTHER_SEARCH:
      renderUserListByMode(allUsers_Filtered.slice(0, friendsStartIndex_Filtered + USERS_GET_AMOUNT), currentMode)
      break

    case state.FAVORITE:
      renderUserListByMode(favoriteUsers.slice(0, favoriteStartIndex + USERS_GET_AMOUNT), currentMode)
      break

    case state.FAVORTIE_SEARCH:
    case state.FAVORTIE_ANOTHER_SEARCH:
      renderUserListByMode(favoriteUsers_Filtered.slice(0, favoriteStartIndex_Filtered + USERS_GET_AMOUNT), currentMode)
      break

    default:
      console.error(`The state has something wrong! currentState: ${tempState}`)
      break;
  }

  currentState = tempState              // Restore the web state
  resetState()
}

/**
 * Event Listeners
 */
// Switch to All Friends
friendsLink.addEventListener("click", event => {
  friendsPage.classList.add("active")
  favoritePage.classList.remove("active")

  friendsStartIndex = 0
  currentState = state.FRIENDS

  renderUserListByMode(getUsersByStartIndex(allUsers, 0), currentMode)
})

// Switch to Favorite Friends
favoriteLink.addEventListener("click", event => {
  friendsPage.classList.remove("active")
  favoritePage.classList.add("active")

  favoriteStartIndex = 0
  currentState = state.FAVORITE

  renderUserListByMode(getUsersByStartIndex(favoriteUsers, 0), currentMode)
})

dataPanel.addEventListener("click", event => {
  event.preventDefault()
  /* Display the user modal */
  const clickedEl = event.path.find(element => {
    if (element.tagName === "A" || element.tagName === "BUTTON") {
      if (element.matches('.user-info')) {
        return element
      } else {
        return null
      }
    }
  })
  if (clickedEl) {
    showUserModalById(Number(clickedEl.dataset.id))
    // Pop out the modal
    setTimeout(() => {
      $('#user-modal').modal()
    }, 0)
  }

  /* Add to/Remove from Favorite  */
  if (event.target.matches(".favorite-icon")) {
    const favoriteIcon = event.target
    favoriteIcon.classList.toggle("far")
    favoriteIcon.classList.toggle("fas")

    updateFavoriteUser(Number(favoriteIcon.dataset.id))
    updateFavoriteUserFiltered(Number(favoriteIcon.dataset.id))

    // In the Favorite-related state
    if (currentState === state.FAVORITE || currentState === state.FAVORTIE_SEARCH || currentState === state.FAVORTIE_ANOTHER_SEARCH) {
      const stateFlag = currentState

      if (stateFlag === state.FAVORITE) {
        currentState = state.FAVORITE_REFRESH
        renderUserListByMode(favoriteUsers, currentMode)
      } else if (stateFlag === state.FAVORTIE_SEARCH || currentState === state.FAVORTIE_ANOTHER_SEARCH) {
        currentState = state.FAVORTIE_SEARCH_REFRESH
        renderUserListByMode(favoriteUsers_Filtered, currentMode)
      }

      resetState()
    }

    renderFavoriteAmount()
  }
})

// Infinite scrolling and render
window.addEventListener("scroll", event => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement

  if (scrollTop + clientHeight >= scrollHeight - 0.5) {
    switch (currentState) {
      case state.FRIENDS:
        friendsStartIndex += USERS_GET_AMOUNT
        renderUserListByMode(getUsersByStartIndex(allUsers, friendsStartIndex), currentMode)
        break

      case state.FRIENDS_SEARCH:
      case state.FRIENDS_ANOTHER_SEARCH:
        friendsStartIndex_Filtered += USERS_GET_AMOUNT
        renderUserListByMode(getUsersByStartIndex(allUsers_Filtered, friendsStartIndex_Filtered), currentMode)
        break

      case state.FAVORITE:
        favoriteStartIndex += USERS_GET_AMOUNT
        renderUserListByMode(getUsersByStartIndex(favoriteUsers, favoriteStartIndex), currentMode)
        break

      case state.FAVORTIE_SEARCH:
      case state.FAVORTIE_ANOTHER_SEARCH:
        favoriteStartIndex_Filtered += USERS_GET_AMOUNT
        renderUserListByMode(getUsersByStartIndex(favoriteUsers_Filtered, favoriteStartIndex_Filtered), currentMode)
        break

      default:
        console.error(`The state has something wrong! currentState: ${currentState}`)
    }

  }
})

// Search friends
btnSearch.addEventListener("click", () => {
  if (!input.value.trim()) {
    return alert("Empty keyword is not allowed!")
  } else {
    resetState()

    const searchTerm = input.value.trim().toUpperCase()
    // Start searching
    if (currentState === state.FRIENDS ||
      currentState === state.FRIENDS_SEARCH) {
      allUsers_Filtered = getFilterResults(allUsers, searchTerm)

      friendsStartIndex_Filtered = 0
      // Set the state
      const stateFlag = currentState
      if (stateFlag === state.FRIENDS) {
        currentState = state.FRIENDS_SEARCH
      } else if (stateFlag === state.FRIENDS_SEARCH) {
        currentState = state.FRIENDS_ANOTHER_SEARCH
      }

      renderUserListByMode(getUsersByStartIndex(allUsers_Filtered, 0), currentMode)

    } else if (currentState === state.FAVORITE ||
      currentState === state.FAVORTIE_SEARCH) {
      favoriteUsers_Filtered = getFilterResults(favoriteUsers, searchTerm)

      favoriteStartIndex_Filtered = 0
      // Set the state
      const stateFlag = currentState
      if (stateFlag === state.FAVORITE) {
        currentState = state.FAVORTIE_SEARCH
      } else if (stateFlag === state.FAVORTIE_SEARCH) {
        currentState = state.FAVORTIE_ANOTHER_SEARCH
      }

      renderUserListByMode(getUsersByStartIndex(favoriteUsers_Filtered, 0), currentMode)
    }
    // clear the input
    input.value = ''
  }
})

// Switch the screen mode
view.addEventListener("click", event => {
  const targetClassList = event.target.classList
  if (targetClassList.contains("view-btn") &&
    !targetClassList.contains("active")) {

    if (targetClassList.contains("fa-th")) {
      currentMode = viewMode.GRID
    } else {
      currentMode = viewMode.BAR
    }
    renderViewMode(currentMode)
    reRenderUserListByViewMode()
  }
})

// Resize the window and switch to BAR mode
window.addEventListener("resize", event => {
  if (window.innerWidth <= MOBILE_SIZE) {
    currentMode = viewMode.BAR
    renderViewMode(currentMode)
    reRenderUserListByViewMode()
  }
})