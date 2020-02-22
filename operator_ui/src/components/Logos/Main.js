import { Logo } from '@nulink/styleguide'
import PropTypes from 'prop-types'
import React from 'react'
import src from '../../images/nulink-operator-logo.svg'

const Main = props => {
  return <Logo src={src} alt="NuLink Operator" {...props} />
}

Main.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
}

export default Main
