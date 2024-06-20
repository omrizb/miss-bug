const { Link } = ReactRouterDOM

import { BugPreview } from './BugPreview.jsx'

export function BugList({ bugs, onRemoveBug, onEditBug }) {
  return (
    <div className="list-container">
      <ul className="bug-list">
        {bugs.map((bug) => (
          <li className="bug-preview" key={bug._id}>
            <BugPreview bug={bug} />
            <div>
              <button
                onClick={() => {
                  onRemoveBug(bug._id)
                }}
              >
                x
              </button>
              <button
                onClick={() => {
                  onEditBug(bug)
                }}
              >
                Edit
              </button>
              <Link to={`/bug/${bug._id}`}><button>Details</button></Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
