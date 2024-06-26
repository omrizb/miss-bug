const { useState, useEffect } = React

export function BugFilterAndSort({ queryParams, onSetQueryParams, allLabels, pageCount }) {

    const [queryParamsToEdit, setQueryParamsToEdit] = useState(queryParams)

    useEffect(() => {
        onSetQueryParams(queryParamsToEdit)
    }, [queryParamsToEdit])

    function clearFilters() {
        setQueryParamsToEdit({
            filterBy: {
                txt: '',
                minSeverity: '',
                labels: []
            },
            sortBy: '',
            sortDir: '',
            pageIdx: 0
        })
    }

    function handleFilterChange({ target }) {
        const field = target.name
        let value = target.value

        switch (target.type) {
            case 'number':
                value = +value || ''
                break
            default:
                break
        }

        setQueryParamsToEdit(prevQueryParams => ({
            ...prevQueryParams,
            filterBy: {
                ...prevQueryParams.filterBy,
                [field]: value
            },
            pageIdx: 0
        }))
    }

    function handleSortByChange({ target }) {
        const field = target.value

        setQueryParamsToEdit(prevQueryParams => ({
            ...prevQueryParams,
            sortBy: field,
            sortDir: 1,
            pageIdx: 0
        }))
    }

    function handleSortDirChange({ target }) {
        const dir = +target.value

        setQueryParamsToEdit(prevQueryParams => ({
            ...prevQueryParams,
            sortDir: dir,
            pageIdx: 0
        }))
    }

    function handleLabelChange({ target }) {
        const label = target.name
        const isChecked = target.checked

        setQueryParamsToEdit(prevQueryParams => ({
            ...prevQueryParams,
            filterBy: {
                ...prevQueryParams.filterBy,
                labels: isChecked
                    ? [...prevQueryParams.filterBy.labels, label]
                    : prevQueryParams.filterBy.labels.filter(prevLabel => prevLabel !== label)
            },
            pageIdx: 0
        }))
    }

    function onGetPage(diff) {
        let pageIdx = queryParamsToEdit.pageIdx + diff
        if (pageIdx < 0) return
        if (pageIdx > pageCount - 1) return
        setQueryParamsToEdit(prevQueryParams => ({ ...prevQueryParams, pageIdx }))
    }

    const { filterBy, sortBy, sortDir, pageIdx } = queryParamsToEdit

    return (
        <div className="bug-filter-and-sort">
            <h2>Filter and sort bugs</h2>
            <button className="btn" onClick={() => clearFilters()}>Clear</button>
            <div className="filter-section">
                <input
                    value={filterBy.txt}
                    onChange={handleFilterChange}
                    type="text"
                    name="txt"
                    placeholder="Search..."
                />
                <input
                    value={filterBy.minSeverity}
                    onChange={handleFilterChange}
                    type="number"
                    name="minSeverity"
                    placeholder="Minimum severity..."
                />
            </div>
            <div className="filter-section">
                <p>Sort by:</p>
                <select value={sortBy} onChange={handleSortByChange} name="sortBy">
                    <option value="">Select sorting</option>
                    <option value="title">Title</option>
                    <option value="severity">Severity</option>
                    <option value="createdAt">Created At</option>
                </select>

                <p>Direction:</p>
                <label>
                    <input
                        value="1"
                        onChange={handleSortDirChange}
                        name="sortDir"
                        id="sortDirUp"
                        type="radio"
                        checked={sortDir === 1}
                    />
                    ↑
                </label>
                <label>
                    <input
                        value="-1"
                        onChange={handleSortDirChange}
                        name="sortDir"
                        id="sortDirDown"
                        type="radio"
                        checked={sortDir === -1}
                    />
                    ↓
                </label>
            </div>
            <div className="filter-section">
                <ul>
                    {allLabels.map(label => (
                        <li key={label}>
                            <label>
                                <input
                                    name={label}
                                    onChange={handleLabelChange}
                                    type="checkbox"
                                    checked={filterBy.labels.includes(label)}
                                />
                                {label}
                            </label>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="filter-section">
                <button className="btn-square" onClick={() => onGetPage(-1)}>-</button>
                <span>{pageIdx + 1} / {pageCount}</span>
                <button className="btn-square" onClick={() => onGetPage(1)}> +</button>
            </div>
        </div >
    )

}