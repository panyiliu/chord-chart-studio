import './SidebarOptionsPanel.scss';

import React from 'react';

import OptionPanel from '../../../../optionsPanels/_components/OptionsPanel';

import OptionsGroup from './OptionsGroup';
import SectionHeading from './SectionHeading';
import Select from './Select';
import Slider from './Slider';
import Toggle from './Toggle';
import TransposeStepButtons from './TransposeStepButtons';

function getEntryComponent(type) {
	switch (type) {
		case 'optionsGroup':
			return OptionsGroup;
		case 'sectionHeading':
			return SectionHeading;
		case 'select':
			return Select;
		case 'slider':
			return Slider;
		case 'transposeStepButtons':
			return TransposeStepButtons;
		case 'toggle':
			return Toggle;
	}
}

export default function SidebarOptionPanel(props) {
	return (
		<div className={'sb-optionsPanel'}>
			<OptionPanel {...props} getEntryComponent={getEntryComponent} />
		</div>
	);
}
