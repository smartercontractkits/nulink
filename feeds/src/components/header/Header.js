import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from 'antd'
import { withRouter } from 'react-router'
import NuLinkLogo from 'components/shared/NuLinkLogo'
import ReactGA from 'react-ga'

const Header = ({ location }) => {
  return (
    <header className="header">
      <div className="header__main-nav">
        <Link to="/">
          <div className="header__logotype">
            <NuLinkLogo />
            <h1>NuLink</h1>
          </div>
        </Link>
        {location.pathname !== '/' && (
          <Link to={`/`}>
            <Button type="primary" ghost icon="left">
              Back to listing
            </Button>
          </Link>
        )}
      </div>
      <div className="header__secondary-nav">
        {location.pathname !== '/' && (
          <a
            onClick={() =>
              ReactGA.event({
                category: 'Form Conversion',
                action: 'Click on Button',
                label: 'Integrate with NuLink',
              })
            }
            href="https://nulinkcommunity.typeform.com/to/XcgLVP"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button type="primary" shape="round">
              Integrate with NuLink
            </Button>
          </a>
        )}
      </div>
    </header>
  )
}

export default withRouter(Header)
