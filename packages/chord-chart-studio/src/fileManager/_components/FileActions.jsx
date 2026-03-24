import React from 'react';
import PropTypes from 'prop-types';

import FileActionEntry from './FileActionEntry';
import { useI18n } from '../../ui/i18n/I18nProvider';

function FileActions(props) {
	const {
		selected,
		deleteFile,
		enableRename,
		startImport,
		backupNow,
		exportAsText,
		printFile,
		onNewScratch,
	} = props;

	const { t } = useI18n();

	const actions = [
		{
			icon: 'add_circle',
			text: t('空白'),
			hint: t('新建空白曲目；和弦与歌词在中间 ChordMark 编辑区编写。'),
			action: onNewScratch,
			isDisabled: false,
		},
		{
			icon: 'upload',
			text: t('导入'),
			hint: t('ChordPro / Ultimate Guitar 等转为 ChordMark。'),
			action: startImport,
			isDisabled: false,
		},
		{
			icon: 'create',
			text: t('重命名'),
			hint: t('重命名列表中的当前曲目。'),
			action: enableRename,
			isDisabled: !selected,
		},
		{
			icon: 'delete',
			text: t('删除'),
			hint: t('删除当前曲目。焦点在左侧曲库区域内时也可按 Delete 键打开确认。'),
			action: deleteFile,
			isDisabled: !selected,
		},
		{
			icon: 'print',
			text: t('打印'),
			hint: t('打印当前曲目预览。'),
			action: printFile,
			isDisabled: !selected,
		},
		{
			icon: 'download',
			text: t('导出'),
			hint: t('导出为文本（格式在导出页选择）。'),
			action: exportAsText,
			isDisabled: !selected,
		},
		{
			icon: 'backup',
			text: t('云备份'),
			hint: t('立即云备份（覆盖云端同一对象）。'),
			action: backupNow,
			isDisabled: false,
		},
	];

	return (
		<div className={'fileManager-actionsWrap'}>
			<div
				className={
					'fileManager-actionsList fileManager-actionsList--compactAll'
				}
			>
				{actions.map((action, key) => (
					<FileActionEntry {...action} key={`action-${key}`} />
				))}
			</div>
		</div>
	);
}

FileActions.propTypes = {
	selected: PropTypes.string,
	deleteFile: PropTypes.func.isRequired,
	enableRename: PropTypes.func.isRequired,
	exportAsText: PropTypes.func.isRequired,
	printFile: PropTypes.func.isRequired,
	startImport: PropTypes.func.isRequired,
	backupNow: PropTypes.func.isRequired,
	onNewScratch: PropTypes.func.isRequired,
};

export default React.memo(FileActions);
