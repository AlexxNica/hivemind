import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import {EJSON} from 'meteor/ejson'

import { Entries } from '../api/entries.js';
import Entry from './Entry.jsx';

// App component - represents the whole app
class App extends Component {
  handleEntryChange(newEntry) {
    const serializedEntry = {
      title: newEntry.title,
      // The description is fancy--can't store it directly.
      description: EJSON.stringify(newEntry.description),
    };

    Entries.update(newEntry._id, {$set: serializedEntry});
  }

  addEntry() {
    Entries.insert({
      createdAt: new Date()
    });
  }

  deleteEntry(entry) {
    Entries.remove(entry._id)
  }

  renderEntries() {
    return this.props.entries.map((entry) => (
      <Entry
        key={entry._id}
        entry={entry}
        onChange={this.handleEntryChange}
        onDelete={() => this.deleteEntry(entry)}
      />
    ));
  }

  render() {
    return (
      <div className="container">
        <header>
          <h1>Entries</h1>
        </header>
        <button onClick={this.addEntry}>Add Entry</button>
        {this.renderEntries()}
      </div>
    );
  }
}

App.propTypes = {
  entries: PropTypes.array.isRequired,
};

export default createContainer(() => {
  return {
    entries: Entries.find({}, {sort: [["createdAt", "desc"]]})
      .fetch() // A shame this can't stay lazy...
      // Deserialize the fancy description.
      .map((entry) => {
        const description = entry.description ? EJSON.parse(entry.description) : undefined
        return {...entry, description: description}
      }),
  };
}, App);
