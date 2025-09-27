/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

const AdminHeader = ({
    activeView,
    onViewChange,
    filters,
    onFilterChange,
    sortBy,
    onSortChange,
    users,
    categories
}) => {
    return (
        <div className="cht-admin-header">
            <div className="cht-header-top">
                <h1 className="cht-page-title">
                    {__('Website Tasks', 'client-handoff-toolkit')}
                </h1>
                <div className="cht-header-actions">
                    <button className="cht-btn cht-btn-outline">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
                        </svg>
                        {__('Settings', 'client-handoff-toolkit')}
                    </button>
                    <button className="cht-btn cht-btn-primary">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
                            <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/>
                        </svg>
                        {__('Tasks', 'client-handoff-toolkit')}
                    </button>
                </div>
            </div>
            
            <div className="cht-header-controls">
                <div className="cht-view-toggle">
                    <button 
                        className={`cht-view-btn ${activeView === 'kanban' ? 'active' : ''}`}
                        onClick={() => onViewChange('kanban')}
                    >
                        {__('Kanban', 'client-handoff-toolkit')}
                    </button>
                    <button 
                        className={`cht-view-btn ${activeView === 'list' ? 'active' : ''}`}
                        onClick={() => onViewChange('list')}
                    >
                        {__('List', 'client-handoff-toolkit')}
                    </button>
                </div>
                
                <div className="cht-filters">
                    <select 
                        value={filters.status}
                        onChange={(e) => onFilterChange('status', e.target.value)}
                        className="cht-filter-select"
                    >
                        <option value="">{__('Filter by Status', 'client-handoff-toolkit')}</option>
                        <option value="open">{__('Todo', 'client-handoff-toolkit')}</option>
                        <option value="in_progress">{__('In Progress', 'client-handoff-toolkit')}</option>
                        <option value="resolved">{__('Completed', 'client-handoff-toolkit')}</option>
                    </select>
                    
                    <select 
                        value={filters.user}
                        onChange={(e) => onFilterChange('user', e.target.value)}
                        className="cht-filter-select"
                    >
                        <option value="">{__('Filter by User', 'client-handoff-toolkit')}</option>
                        {users.map(user => (
                            <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                    </select>
                    
                    <select 
                        value={sortBy}
                        onChange={(e) => onSortChange(e.target.value)}
                        className="cht-filter-select"
                    >
                        <option value="created_at">{__('Sort by Date', 'client-handoff-toolkit')}</option>
                        <option value="updated_at">{__('Sort by Updated', 'client-handoff-toolkit')}</option>
                        <option value="priority">{__('Sort by Priority', 'client-handoff-toolkit')}</option>
                    </select>
                    
                    <select 
                        value={filters.category}
                        onChange={(e) => onFilterChange('category', e.target.value)}
                        className="cht-filter-select"
                    >
                        <option value="">{__('Filter by Category', 'client-handoff-toolkit')}</option>
                        {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default AdminHeader;