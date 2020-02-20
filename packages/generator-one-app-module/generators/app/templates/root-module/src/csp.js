import contentSecurityPolicyBuilder from 'content-security-policy-builder';
import ip from 'ip';

const developmentAdditions = process.env.NODE_ENV === 'development' ? [
  `${ip.address()}:${process.env.HTTP_ONE_APP_DEV_CDN_PORT || 3001}`,
  `localhost:${process.env.HTTP_ONE_APP_DEV_CDN_PORT || 3001}`,
]
  : [];

// Read about csp:
// https://github.com/americanexpress/one-app/blob/master/docs/api/modules/App-Configuration.md#csp
export default contentSecurityPolicyBuilder({
  directives: {
    reportUri: `${process.env.ONE_CLIENT_REPORTING_URL}/report/security/csp-violation`,
    defaultSrc: [
      "'self'",
    ],
    scriptSrc: [
      "'self'",
      ...developmentAdditions,
    ],
    imgSrc: [
      "'self'",
    ],
    styleSrc: [
      "'self'",
      "'unsafe-inline'",
    ],
    connectSrc: [
      "'self'",
      ...developmentAdditions,
    ],
  },
});
