const TempPage = ({ pageName }) => {
  const getPageTitle = (name) => {
    return name.charAt(0).toUpperCase() + name.slice(1)
  }

  const getPageDescription = (name) => {
    const descriptions = {
      courses: 'Browse and manage your enrolled courses, track progress, and discover new learning opportunities.',
      assignments: 'View upcoming assignments, submit work, and track your grades and feedback.',
      schedule: 'Manage your learning schedule, set study reminders, and plan your academic calendar.',
      analytics: 'Dive deep into your learning analytics, performance metrics, and progress insights.',
      profile: 'Manage your profile settings, preferences, and account information.'
    }
    return descriptions[name] || `This is a temporary page for ${name} navigation.`
  }

  return (
    <div className="page-content">
      <div className="temp-page">
        <div className="temp-page-icon">
          <i className={getPageIcon(pageName)}></i>
        </div>
        <h1>{getPageTitle(pageName)}</h1>
        <p>{getPageDescription(pageName)}</p>
        <div className="temp-page-features">
          <h3>Coming Soon:</h3>
          <ul>
            {getFeatureList(pageName).map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

const getPageIcon = (pageName) => {
  const icons = {
    courses: 'fas fa-book',
    assignments: 'fas fa-tasks',
    schedule: 'fas fa-calendar',
    analytics: 'fas fa-chart-bar',
    profile: 'fas fa-user'
  }
  return icons[pageName] || 'fas fa-file'
}

const getFeatureList = (pageName) => {
  const features = {
    courses: [
      'Course catalog with search and filters',
      'Detailed course progress tracking',
      'Interactive video lessons',
      'Course recommendations'
    ],
    assignments: [
      'Assignment submission portal',
      'Grade tracking and history',
      'Peer review system',
      'Automated feedback'
    ],
    schedule: [
      'Interactive calendar view',
      'Study session planning',
      'Deadline reminders',
      'Time blocking features'
    ],
    analytics: [
      'Detailed performance metrics',
      'Learning path optimization',
      'Comparative analysis',
      'Goal setting and tracking'
    ],
    profile: [
      'Personal information management',
      'Learning preferences',
      'Notification settings',
      'Privacy controls'
    ]
  }
  return features[pageName] || ['Feature planning in progress']
}

export default TempPage
