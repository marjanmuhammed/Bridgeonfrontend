import axios from 'axios';

class GithubApi {
  // Get GitHub contributions
  static async getContributions(username) {
    try {
      // Using GitHub's GraphQL API for contribution data
      const query = `
        query($username: String!) {
          user(login: $username) {
            contributionsCollection {
              contributionCalendar {
                totalContributions
                weeks {
                  contributionDays {
                    contributionCount
                    date
                  }
                }
              }
            }
            repositories(ownerAffiliations: OWNER, first: 100) {
              totalCount
              nodes {
                name
                stargazerCount
                forkCount
                languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
                  nodes {
                    name
                    color
                  }
                }
              }
            }
          }
        }
      `;

      const response = await axios.post(
        'https://api.github.com/graphql',
        { query, variables: { username } },
        {
          headers: {
            'Authorization': `Bearer ${process.env.REACT_APP_GITHUB_TOKEN}`,
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
      }

      return response.data.data.user;
    } catch (error) {
      console.error('GitHub API Error:', error);
      throw new Error('Failed to fetch GitHub data');
    }
  }

  // Alternative REST API method (if GraphQL fails)
  static async getContributionsREST(username) {
    try {
      const response = await axios.get(
        `https://api.github.com/users/${username}/events/public`
      );
      
      const contributions = response.data.reduce((acc, event) => {
        const date = event.created_at.split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      return {
        totalContributions: Object.values(contributions).reduce((sum, count) => sum + count, 0),
        contributions
      };
    } catch (error) {
      console.error('GitHub REST API Error:', error);
      throw new Error('Failed to fetch GitHub contributions');
    }
  }
}

export default GithubApi;