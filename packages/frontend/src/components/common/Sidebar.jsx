import React from 'react'
import Header from './Header'
import Navigation from './Navigation'
import ProfileSection from './ProfileSection'
import Tabs from './Tabs'

const Sidebar = ({ userData, onSearch, activeTab, onTabChange }) => {
  return (
    <div className="layout">
      <Header onSearch={onSearch} />
      <Navigation />
      <div className="container">
        <ProfileSection user={userData} />
        <Tabs activeTab={activeTab} onTabChange={onTabChange} />
      </div>
    </div>
  )
}

export default Sidebar

// const Sidebar = () => {
//   return (
//     <body>
//       <div class="header">
//         <div class="logo">
//           <i classs="fas fa-home"></i>
//         </div>

//         <div class="search-bar">
//           <input type="text" placeholder="Search..." />
//           <i class="fas fa-search"></i>
//         </div>
//         <div class="profile">
//           <i class="fas fa-user-circle"></i>
//         </div>
//       </div>

//       <div class="sidebar">
//         <a href="#">
//           <i class="fas fa-home"> </i>
//         </a>
//         <a href="#">
//           <i class="fas fa-bell"> </i>
//         </a>
//         <a href="#">
//           <i class="fas fa-plus"> </i>
//         </a>
//         <a href="#">
//           <i class="fas fa-comment-dots"> </i>
//         </a>
//         <a href="#">
//           <i class="fas fa-user"> </i>
//         </a>
//       </div>

//       <div class="container">
//         <div class="profile-section">
//           <img
//             alt="Profile Initial"
//             height="100"
//             src="https://storage.googleapis.com/a1aa/image/guR6S4VOgGrvIReIavThKwp5wccDdkmGFRlWCrn3IR4uMDAKA.jpg"
//             width="100"
//           />
//           <h1>Jace Sam</h1>
//           <p>@jacesam0</p>
//           <p>2 following</p>
//           <div class="buttons">
//             <button>Share</button>
//             <button>Edit profile</button>
//           </div>
//         </div>
//         <div class="tabs">
//           <a class="active" href="#"> Created </a>
//           <a href="#"> Saved </a>
//         </div>
//       </div>
//     </body>
//   )
// }


// export default Sidebar