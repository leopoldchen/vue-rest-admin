import { ActiveQuery } from '@/utils/query';
import { i18n } from '@/i18n';

const commonOps = () => {
  return [
    {
      key: 'eq',
      value: i18n.t('base.queryOp.eq')
    },
    {
      key: 'ne',
      value: i18n.t('base.queryOp.ne')
    }
  ];
};

export const queryOps = () => {
  return {
    Number: commonOps().concat([
      {
        key: 'gt',
        value: i18n.t('base.queryOp.gt')
      },
      {
        key: 'gte',
        value: i18n.t('base.queryOp.gte')
      },
      {
        key: 'lt',
        value: i18n.t('base.queryOp.lt')
      },
      {
        key: 'lte',
        value: i18n.t('base.queryOp.lte')
      },
      {
        key: 'in',
        value: i18n.t('base.queryOp.in')
      },
      {
        key: 'notIn',
        value: i18n.t('base.queryOp.notIn')
      }
    ]),
    String: commonOps().concat([
      {
        key: 'like',
        value: i18n.t('base.queryOp.like')
      },
      {
        key: 'notLike',
        value: i18n.t('base.queryOp.notLike')
      }
    ]),
    Date: commonOps().concat([
      {
        key: 'gt',
        value: i18n.t('base.queryOp.gt')
      },
      {
        key: 'gte',
        value: i18n.t('base.queryOp.gte')
      },
      {
        key: 'lt',
        value: i18n.t('base.queryOp.lt')
      },
      {
        key: 'lte',
        value: i18n.t('base.queryOp.lte')
      },
      {
        key: 'in',
        value: i18n.t('base.queryOp.in')
      },
      {
        key: 'notIn',
        value: i18n.t('base.queryOp.notIn')
      }
    ])
  };
};

export const getQueryOps = type => {
  return queryOps()[type] || commonOps();
};

export const parseQuery = ({ q, op, value }) => {
  const key = ActiveQuery.queryKey(q, op);
  switch (op) {
    case 'like':
    case 'notLike':
      return {
        [key]: '%' + value + '%'
      };
    case 'in':
    case 'notIn':
      return {
        [key]: value.split(',')
      };
    default:
      return {
        [key]: value
      };
  }
};
