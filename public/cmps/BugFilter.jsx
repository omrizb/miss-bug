const { useState, useEffect } = React

export function BugFilter({ filterBy, onSetFilterBy }) {

    const [filterByToEdit, setFilterByToEdit] = useState(filterBy)

    useEffect(() => {
        onSetFilterBy(filterByToEdit)
    }, [filterByToEdit])

    function handleChange({ target }) {
        const field = target.name
        let value = target.value

        switch (target.type) {
            case 'number':
                value = +value || ''
                break
            case 'range':
                value = +value || ''
                break
            case 'checkbox':
                value = target.checked ? 1 : -1
                break
            default:
                break
        }

        setFilterByToEdit(prevFilter => ({ ...prevFilter, [field]: value, pageIdx: 0 }))
    }

    const { txt, minSeverity } = filterByToEdit

    return (
        <div className="bug-filter">
            <h2>Filter bugs</h2>
            <input
                value={txt}
                onChange={handleChange}
                type="text"
                name="txt"
                placeholder="Search..."
            />
            <input
                value={minSeverity}
                onChange={handleChange}
                type="number"
                name="minSeverity"
                placeholder="Minimum severity..."
            />
        </div>
    )

}