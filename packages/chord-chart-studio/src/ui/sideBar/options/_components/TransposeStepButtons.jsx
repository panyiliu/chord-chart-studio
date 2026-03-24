import './TransposeStepButtons.scss';

import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import { getEditorMode } from '../../../layout/app/_state/selectors';
import { useI18n } from '../../../i18n/I18nProvider';

function clamp(n, min, max) {
	return Math.min(max, Math.max(min, n));
}

function TransposeStepButtons(props) {
	const {
		isInteractable,
		optionContext,
		optionKey,
		optionValue,
		setOption,
		min,
		max,
		step,
	} = props;

	const editorMode = useSelector(getEditorMode);
	const { lang, t } = useI18n();

	// Only show in Screen view & Print view.
	if (editorMode !== 'play' && editorMode !== 'print') {
		return null;
	}

	const current = Number(optionValue);
	const safeCurrent = Number.isFinite(current) ? current : 0;

	const safeMin = typeof min === 'number' ? min : -11;
	const safeMax = typeof max === 'number' ? max : 11;
	const safeStep = typeof step === 'number' ? step : 1;

	const nextDown = clamp(safeCurrent - safeStep, safeMin, safeMax);
	const nextUp = clamp(safeCurrent + safeStep, safeMin, safeMax);

	const isReset = safeCurrent === 0;

	const canInteract = isInteractable;
	const parenL = lang === 'en' ? '(' : '（';
	const parenR = lang === 'en' ? ')' : '）';
	const downSuffix = `${nextDown >= 0 ? '+' : ''}${nextDown}`;
	const upSuffix = `${nextUp >= 0 ? '+' : ''}${nextUp}`;
	const downTitle = `${t('降')}${parenL}${downSuffix}${parenR}`;
	const upTitle = `${t('升')}${parenL}${upSuffix}${parenR}`;
	const resetTitle = isReset
		? t('已复原')
		: `${t('复原')}${parenL}0${parenR}`;

	return (
		<div
			className={[
				'sb-optionTransposeStepButtons',
				canInteract
					? ''
					: 'sb-optionTransposeStepButtons-isNotInteractable',
			]
				.filter(Boolean)
				.join(' ')}
		>
			<button
				type="button"
				className={
					'sb-optionTransposeStepButtons-btn sb-optionTransposeStepButtons-btn--down'
				}
				onClick={() => setOption(optionContext, optionKey, nextDown)}
				disabled={!canInteract || nextDown === safeCurrent}
				title={downTitle}
			>
				{t('降')}
			</button>
			<button
				type="button"
				className={
					'sb-optionTransposeStepButtons-btn sb-optionTransposeStepButtons-btn--reset'
				}
				onClick={() => setOption(optionContext, optionKey, 0)}
				disabled={!canInteract || isReset}
				title={resetTitle}
			>
				{t('复原')}
			</button>
			<button
				type="button"
				className={
					'sb-optionTransposeStepButtons-btn sb-optionTransposeStepButtons-btn--up'
				}
				onClick={() => setOption(optionContext, optionKey, nextUp)}
				disabled={!canInteract || nextUp === safeCurrent}
				title={upTitle}
			>
				{t('升')}
			</button>
		</div>
	);
}

TransposeStepButtons.propTypes = {
	isInteractable: PropTypes.bool.isRequired,
	optionContext: PropTypes.string.isRequired,
	optionKey: PropTypes.string.isRequired,
	optionValue: PropTypes.number.isRequired,
	setOption: PropTypes.func.isRequired,
	min: PropTypes.number,
	max: PropTypes.number,
	step: PropTypes.number,
};

TransposeStepButtons.defaultProps = {
	min: -11,
	max: 11,
	step: 1,
};

export default React.memo(TransposeStepButtons);
