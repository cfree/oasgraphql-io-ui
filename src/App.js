import React, { useState, useCallback } from 'react';
import CodeMirror from 'react-codemirror';
// import classNames from 'classnames';
import JSONPretty from 'react-json-prettify';

import 'codemirror/lib/codemirror.css';
import './App.css';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/lint/lint';
import 'codemirror/mode/javascript/javascript';

const BASE_URL = process.env.NODE_ENV === 'development' ? '' : 'https://oasgraphql-api.herokuapp.com';

function App() {
  const [swaggerCode, setSwaggerCode] = useState('');
  const [graphqlId, setGraphqlId] = useState('');
  const [graphqlReport, setGraphqlReport] = useState({});
  const [graphqlSchema, setGraphqlSchema] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSwaggerChange = useCallback((newCode) => {
    setSwaggerCode(newCode);
  }, [setSwaggerCode]);
  const handleClick = useCallback(() => {
    const getAsyncSchema = async () => {
      setLoading(true);
      const results = await fetch(`${BASE_URL}/convert`, {
        method: 'POST',
        body: swaggerCode,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const jsonResults = await results.json();
      setGraphqlId(jsonResults.id);
      setGraphqlReport(jsonResults.report);
      setGraphqlSchema(jsonResults.schema);
      setLoading(false);
    };
    getAsyncSchema();
  }, [setLoading, swaggerCode]);
  
  return (
    <div className="App">
      <header className="App-header">OASGraphQL</header>
      <main className="App-main">
        <section className="editor">
          <header className="editor-header">
            <h2>OpenAPI Schema</h2>
            <button
              className="create-graphql-button"
              onClick={handleClick}
              disabled={loading || !swaggerCode}
            >
              Create
            </button>
          </header>
          <div className="editor-main">
            <CodeMirror
              value={swaggerCode}
              onChange={handleSwaggerChange}
              options={{
                mode: {
                  name: 'javascript',
                  json: true,
                },
                tabSize: 2,
                lineNumbers: true,
                lint: true,
              }}
              autoFocus={true}
            />
          </div>
        </section>
        <section className="editor">
          <header className="editor-header">
            <h2>Report</h2>
          </header>
          {graphqlId && (
            <div className="editor-results">
              {Object.entries(graphqlReport).map(data => {
                if (data[0] === 'warnings') {
                  return (
                    <>
                      <p><strong>Warnings</strong></p>
                      <dl>
                        {data[1].map(warning => (
                          <>
                            <dd>{warning.type}</dd>
                            <dt>{warning.message}</dt>
                          </>
                        ))}
                      </dl>
                    </>
                  );
                }
                return (<p><strong>{data[0]}</strong>: {data[1]}</p>);
              })}

              <a href={`${BASE_URL}/graphql/${graphqlId}`} target="_blank" rel="noopener noreferrer">View GraphiQL</a>

              <JSONPretty json={graphqlSchema} />
            </div>
          )}
          {loading && (
            <div className="graphql-loading">Loading...</div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
