import PropTypes from 'prop-types';

export const RFPListPropTypes = {
  rfps: PropTypes.arrayOf(PropTypes.object).isRequired,
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
  searchQuery: PropTypes.string.isRequired,
  setSearchQuery: PropTypes.func.isRequired,
  onSelectRFP: PropTypes.func.isRequired,
  onRFPAdded: PropTypes.func.isRequired
};




