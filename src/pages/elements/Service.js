import React from 'react';
import { Label, Table } from 'patternfly-react';
import Definition from '../../components/Definition';
import CodeComponents from '../../components/ServiceCodeComponents';
import EndPoints from '../../components/ServiceEndPoints';
import Namespaces from './Namespaces';
import Reports from './Reports';
import Documents from './Documents';

function Service({ service, reports, documents }) {
  const headerFormat = value => <Table.Heading>{value}</Table.Heading>;
  const cellFormat = value => <Table.Cell>{value}</Table.Cell>;
  const linkFormat = url => value => (
    <a href={`${url || ''}${value}`} target="_blank" rel="noopener noreferrer">
      {value}
    </a>
  );
  const emptyFormat = value => value || '-';
  const booleanFormat = (t, f) => value => (value ? t : f);

  function matches(r) {
    if (r.app.name === service.name) {
      return true;
    }
    return false;
  }
  const matchedReports = reports.filter(matches);
  const matchedDocuments = documents.filter(matches);

  let quayReposTable;
  if (service.quayRepos == null) {
    quayReposTable = <p style={{ 'font-style': 'italic' }}>No quay repos.</p>;
  } else {
    const quayRepos = service.quayRepos
      .map(orgGroup =>
        orgGroup.items.map(repo => {
          repo.id = `${orgGroup.org.name}-${repo.name}`;
          repo.repo_name = `${orgGroup.org.name}/${repo.name}`;
          repo.org_name = orgGroup.org.name;
          return repo;
        })
      )
      .reduce((flat, next) => flat.concat(next), [])
      .sort((a, b) => {
        if (a.id > b.id) return 1;
        if (a.id < b.id) return -1;
        return 0;
      });
    quayReposTable = (
      <Table.PfProvider
        striped
        bordered
        columns={[
          {
            header: {
              label: 'Name',
              formatters: [headerFormat]
            },
            cell: {
              formatters: [
                v => (
                  <a href={`https://quay.io/repository/${v}`} target="_blank" rel="noopener noreferrer">
                    {v.split('/')[1]}
                  </a>
                ),
                cellFormat
              ]
            },
            property: 'repo_name'
          },
          {
            header: {
              label: 'Quay Org',
              formatters: [headerFormat]
            },
            cell: {
              formatters: [linkFormat('https://quay.io/organization/'), cellFormat]
            },
            property: 'org_name'
          },
          {
            header: {
              label: 'Description',
              formatters: [headerFormat]
            },
            cell: {
              formatters: [emptyFormat, cellFormat]
            },
            property: 'description'
          },
          {
            header: {
              label: 'Public',
              formatters: [headerFormat]
            },
            cell: {
              formatters: [
                booleanFormat(<Label bsStyle="success">Public</Label>, <Label bsStyle="danger">Private</Label>),
                cellFormat
              ]
            },
            property: 'public'
          }
        ]}
      >
        <Table.Header />
        <Table.Body rows={quayRepos} rowKey="id" />
      </Table.PfProvider>
    );
  }
  let dependenciesTable;
  if (service.dependencies == null) {
    dependenciesTable = <p style={{ 'font-style': 'italic' }}>No dependencies.</p>;
  } else {
    dependenciesTable = (
      <Table.PfProvider
        striped
        bordered
        columns={[
          {
            header: {
              label: 'Name',
              formatters: [headerFormat]
            },
            cell: {
              formatters: [cellFormat]
            },
            property: 'name'
          },
          {
            header: {
              label: 'Status Page',
              formatters: [headerFormat]
            },
            cell: {
              formatters: [linkFormat(), cellFormat]
            },
            property: 'statusPage'
          },
          {
            header: {
              label: 'SLA',
              formatters: [headerFormat]
            },
            cell: {
              formatters: [cellFormat]
            },
            property: 'SLA'
          }
        ]}
      >
        <Table.Header />
        <Table.Body rows={service.dependencies} rowKey="path" />
      </Table.PfProvider>
    );
  }
  const serviceOwners = service.serviceOwners.map(s => [
    [
      s.name,
      ' <',
      <a key={s.email} href={`mailto:${s.email}`}>
        {s.email}
      </a>,
      '>'
    ]
  ]);
  return (
    <React.Fragment>
      <h4>Description</h4>
      <p>{service.description}</p>

      <h4>Info</h4>
      <Definition items={[['SLO', service.performanceParameters.SLO]]} />
      <h4> Service Owners </h4>
      <Definition items={serviceOwners} />

      {service.serviceDocs && (
        <React.Fragment>
          <h4>Service Docs</h4>
          <ul>
            {service.serviceDocs.map(d => (
              <li>
                <a href={d.startsWith('http') ? d : `${window.DOCS_BASE_URL}${d}`}>{d}</a>
              </li>
            ))}
          </ul>
        </React.Fragment>
      )}

      {service.codeComponents && (
        <React.Fragment>
          <h4>Code Components</h4>
          <CodeComponents components={service.codeComponents} />
        </React.Fragment>
      )}

      {service.endPoints && (
        <React.Fragment>
          <h4>End Points</h4>
          <EndPoints endPoints={service.endPoints} />
        </React.Fragment>
      )}

      <h4>Namespaces</h4>
      <Namespaces namespaces={service.namespaces} />

      <h4>Dependencies</h4>
      {dependenciesTable}

      <h4>Quay Repos</h4>
      {quayReposTable}

      {matchedReports.length > 0 && (
        <React.Fragment>
          <h4>Reports</h4>
          <Reports reports={matchedReports} />
        </React.Fragment>
      )}
      {matchedDocuments.length > 0 && (
        <React.Fragment>
          <h4>Documents</h4>
          <Documents documents={matchedDocuments} />
        </React.Fragment>
      )}
    </React.Fragment>
  );
}

export default Service;
