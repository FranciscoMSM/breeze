import React from 'react';
import moment from 'moment';


const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const API = city =>
  `https://query.yahooapis.com/v1/public/yql?q=select * from weather.forecast where woeid in (select woeid from geo.places(1) where text="${city}")&format=json`;

class Widget extends React.Component {
  state = {
    loading: false,
    data: null,
  };

  componentWillMount() {
    fetch(API(this.props.city))
      .then(res => res.json())
      .then(({ query: { results } }) => results)
      .then(({ channel: { item } }) => item)
      .then(data => this.setState({ data }));
  }

  componentWillReceiveProps(nextProps) {
    fetch(API(nextProps.city))
      .then(res => res.json())
      .then(({ query: { results } }) => results)
      .then(({ channel: { item } }) => item)
      .then(data => this.setState({ data }));
  }

  render() {
    const { city } = this.props;
    const { data } = this.state;

    if (data == null) return null;

    return (
      <div>
        <div>{data.condition.temp}</div>
        <div>{data.condition.text}</div>
        <div>{data.condition.date.substring(0, 3)}</div>
        <div style={{ display: 'flex' }}>
          {data.forecast.slice(1, 5).map(day => (
            <div key={day.date}>
              {day.high}
              {day.day}
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export const weather = {
  label: 'weather',
  widgets: {
    main: Widget,
  },
  cmds: [
    {
      condition: 'startsWith',
      label: 'open widget',
      handler: (args, { addWidget, mutateWidgetState }) => [
        {
          id: 'w_0',
          onEnter: () =>
            addWidget({
              plugin: 'weather',
              name: 'main',
              state: { city: 'Coimbra' },
            }),
          text: 'weather widget open',
          help: 'Show weather widget',
        },
      ],
    },
    {
      condition: 'startsWith',
      label: 'change city',
      handler: (args, { addWidget, mutateWidgetState }) => [
        {
          id: 'w_1',
          onEnter: () =>
            mutateWidgetState({
              plugin: 'weather',
              name: 'main',
              state: { city: args.split(' ')[2] },
            }),
          text: 'weather city <city>',
          help: 'Set weather city',
        },
      ],
    },
  ],
};
