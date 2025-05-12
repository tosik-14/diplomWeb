export const RenderPath = ({
                               pathTo = [],
                               activeTab,
                               goToFolder,
                               folders = [],
                               getRootFolderId
                              }) => {

    const renderFolderPath = () => {
        if (!Array.isArray(pathTo) || pathTo.length === 0) {
            return activeTab === 'questions' ? 'Themes' : 'Tickets';
        }

        const rootFolderName = activeTab === 'questions' ? 'Themes' : 'Tickets';
        const pathNames = [
            <span
                key="root"
                className="folder-path__item"
                onClick={() => goToFolder(getRootFolderId())}
                style={{ cursor: 'pointer' }}
            >
                {rootFolderName}
            </span>
        ];

        pathTo.forEach((folderId) => {
            const folder = folders.find(f => f.id === folderId);
            if (folder) {
                pathNames.push(
                    <span
                        key={folderId}
                        className="folder-path__item"
                        onClick={() => goToFolder(folderId)}
                        style={{ cursor: 'pointer' }}
                    >
                        {' / ' + folder.name}
                    </span>
                );
            }
        });

        return pathNames;
    };

    return (
        <div>
            {renderFolderPath()}
        </div>
    )

};