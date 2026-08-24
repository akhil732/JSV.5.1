import { ChartDataValidator } from '../../lib/engines/ChartDataValidator';

describe('ChartDataValidator', () => {
  const mockBirthDetails = {
    name: 'Test Native',
    gender: 'Male' as const,
    date: '1996-11-01',
    time: '12:00',
    approximateTime: false,
    place: 'Hyderabad',
    latitude: 17.385,
    longitude: 78.486,
    timezone: 5.5
  };

  const validHoroscope = {
    horoscope: {
      divisional_charts: {
        'D-1_rasi': {
          Ascendant: { sign: 'Libra', degree: 17.89 },
          Sun: { sign: 'Taurus', degree: 15.2 },
          Moon: { sign: 'Scorpio', degree: 0.81 },
          Mars: { sign: 'Leo', degree: 12.0 },
          Mercury: { sign: 'Gemini', degree: 5.4 },
          Jupiter: { sign: 'Sagittarius', degree: 20.0 },
          Venus: { sign: 'Virgo', degree: 21.0 },
          Saturn: { sign: 'Pisces', degree: 7.0 },
          Rahu: { sign: 'Virgo', degree: 11.0 },
          Ketu: { sign: 'Pisces', degree: 11.0 }
        }
      }
    }
  };

  it('validates and normalizes complete chart data successfully', () => {
    const canonical = ChartDataValidator.validateConsistency(validHoroscope, mockBirthDetails);
    expect(canonical.isValid).toBe(true);
    expect(canonical.rasi.planets.Sun.sign).toBe('Taurus');
    expect(canonical.rasi.planets.Moon.sign).toBe('Scorpio');
    expect(canonical.rasi.planets.Mercury.sign).toBe('Gemini');
  });

  it('throws error when critical D-1 Rasi chart is missing', () => {
    expect(() => {
      ChartDataValidator.validateConsistency({}, mockBirthDetails);
    }).toThrow('CHART_DATA_MISSING');
  });

  it('throws error when a required planet is missing from Rasi chart', () => {
    const incompleteHoroscope = {
      horoscope: {
        divisional_charts: {
          'D-1_rasi': {
            Ascendant: { sign: 'Libra', degree: 17.89 },
            Sun: { sign: 'Taurus', degree: 15.2 }
            // Moon and other planets missing
          }
        }
      }
    };

    expect(() => {
      ChartDataValidator.validateConsistency(incompleteHoroscope, mockBirthDetails);
    }).toThrow('CHART_DATA_INCOMPLETE');
  });
});
