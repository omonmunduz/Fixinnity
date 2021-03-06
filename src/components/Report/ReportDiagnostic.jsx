import React, {Component, Fragment} from 'react';
import MechanicImg1 from './assets/mechanic1.png';
import MechanicImg2 from './assets/mechanic2.png';
import MechanicImg3 from './assets/mechanic3.png';

const quotes = {
  "id": 7,
  "mechanic": {
    "id": 5,
    "name": "Hart Auto",
    "address": "250 Del Medio Ave",
    "city": "Mountain View",
    "state": "CA",
    "zip": "94040"
  },
  "soonestAvailableDateTime": "09/24/2019 17:00",
  "estamatedCompletionDateTime": "09/25/2019 17:00",
  "repairs": [
    {
      "id": 1,
      "name": "Replace rotors",
      "price": 450,
      "level": "URGENT",
      checked: true,
      "isReportedByConsumer": true
    },
    {
      "id": 2,
      "name": "Transmission",
      "price": 500,
      "level": "URGENT",
      checked: true,
      "isReportedByConsumer": false
    },
    {
      "id": 3,
      "name": "Oil Leak",
      "price": 100,
      "level": "URGENT",
      checked: true,
      "isReportedByConsumer": false
    },
    {
      "id": 4,
      "name": "Belts",
      "price": 40,
      "level": "URGENT",
      checked: true,
      "isReportedByConsumer": false
    },
    {
      "id": 5,
      "name": "Tire treading (Left Passenger)",
      "price": 50,
      "level": "RECOMMENDED",
      checked: true,
      "isReportedByConsumer": false
    },
    {
      "id": 6,
      "name": "Tire treading (Right Passenger)",
      "price": 50,
      "level": "RECOMMENDED",
      checked: true,
      "isReportedByConsumer": false
    }
  ]
};
class ReportDiagnostic extends Component {

  constructor(props){
    super(props);
    this.state = {
      quotes: [],
      selectedQuoteId: null,
      activeQuote: 0,
    }
  }

  selectQuote = (selectedQuoteId) => {
    this.setState({selectedQuoteId})
    const selectedQuote = this.state.quotes.filter(e=>e.id===selectedQuoteId)[0];
    let repairIds = '';
    selectedQuote.repairs.forEach(rep=> {
      if(rep.checked){
        repairIds += rep.id + ',';
      }
    })
    repairIds = repairIds.length ? repairIds.slice(0,repairIds.length-1) : repairIds;
    const chooseQuoteUrl = `https://fixinity-api-staging.herokuapp.com/api/v1/quote/chooseOne`;
    const data = {quoteId: selectedQuoteId,repairIds};
    fetch(chooseQuoteUrl,{
      method: 'POST',
      body: JSON.stringify(data),
      headers:{ 'Content-Type': 'application/json'}
    })
      .then(result=>{

      })
      .catch(result=>{

      })
  }

  componentDidMount() {
    const {job: {id}} = this.props;
    const jobRequestUrl = `https://fixinity-api-staging.herokuapp.com/jobRequest/${id}`;
    fetch(jobRequestUrl)
      .then(response=>response.json())
      .then(jobRequestData=>{
        // Get Quotes
        jobRequestData.quotes.forEach(({id,sentToCustomer,isSelected})=>{
          if(!sentToCustomer){
            return // Not Ready quote yet
          }
          if(isSelected){
          this.setState({selectedQuoteId:id})
          }
          const quoteUrl = `https://fixinity-api-staging.herokuapp.com/api/v1/quote?quoteId=${id}`
          fetch(quoteUrl)
            .then(response=>response.json())
            .then(quotes=>{
              let quotesAtstate = [...this.state.quotes];
              quotesAtstate.push(quotes);
              quotesAtstate = quotesAtstate.map(q=>{
                q.repairs = q.repairs.map(r=>{
                  r.checked=true;
                  return r
                })
                return q
              });
              this.setState({quotes:quotesAtstate,loaded:true})
            })
            .catch(err=>{
              this.setState({loaded:true})
            })
        })
      })
      .catch(err=>{
        this.setState({loaded:true})
      })
  }

  issueChecked = id => {
    const {quotes, activeQuote} = this.state;
    quotes[activeQuote].repairs = quotes[activeQuote].repairs.map(issue=>{
      return issue.id === id ? {...issue, checked: !issue.checked} : issue;
    })
    this.setState({quotes})
  }

  openQuote = activeQuote => this.setState({activeQuote})

  render() {
    let {
      reportedIssue, rootCause, recommendation, pricePartsDescription, pricePartsAmountFrom, pricePartsAmountTo,
      priceLaborDescription, priceLaborAmountFrom, priceLaborAmountTo, photos
    } = this.props.data;
    photos = photos || [];
    const { quotes, activeQuote, selectedQuoteId } = this.state;

    let quotesAllContent = (
      <div className="card">
        <div className="card-body">
        Currently requesting quotes from nearby shops. We will text you on your phone as soon as you receive quotes.
        </div>
      </div>
    )

    if(quotes.length) {
      const { mechanic, repairs, soonestAvailableDateTime, estamatedCompletionDateTime, id  } = quotes[activeQuote];
      const mainRepair = repairs.filter(item=>item.isReportedByConsumer);
      const urgentRepair = repairs.filter(item=>!item.isReportedByConsumer && item.level === 'URGENT');
      const recommendedRepair = repairs.filter(item=>item.level === 'RECOMMENDED');
      let mainRepairTitle =  mainRepair.length > 1 ? 'Main Concerns:' : 'Main Concern:';

      const totalPrice = repairs.reduce((acc,cum)=>{
        const price = cum.checked ? cum.price : 0;
        return acc+price
      },0)

      const mainRepairContent = !mainRepair.length ? null : (
        <div>
          <div className="card-title"><strong>{mainRepairTitle}</strong></div>
          <div className="card">
            <div className="card-body">
              {
                mainRepair.map(item=>{
                  return (
                    <div key={item.id} className="input-group mb-3">
                      <div className="form-control bg-danger text-white">
                        {item.name}
                      </div>
                      <div className="input-group-append">
                        <span className="input-group-text"><strong>${item.price}</strong></span>
                        <div className="input-group-text">
                          <input disabled={selectedQuoteId !== null} type="checkbox" checked={item.checked} onClick={()=>this.issueChecked(item.id)} aria-label="Checkbox for following text input"/>
                        </div>
                      </div>
                    </div>
                  )
                })
              }
            </div>
          </div>
        </div>
      );
      const urgentRepairContent = !urgentRepair.length ? null : (
        <div>
          <div className="card-title"><strong>Problems we recommend to be fixed urgently</strong></div>
          <div className="card">
            <div className="card-body">
              {
                urgentRepair.map(item=>{
                  return (
                    <div key={item.id} className="input-group mb-3">
                      <div className="form-control">
                        <span className="inspection-colors bad"/>
                        {item.name}
                      </div>
                      <div className="input-group-append">
                        <span className="input-group-text"><strong>${item.price}</strong></span>
                        <div className="input-group-text">
                          <input disabled={selectedQuoteId !== null} type="checkbox"checked={item.checked} onClick={()=>this.issueChecked(item.id)} aria-label="Checkbox for following text input"/>
                        </div>
                      </div>
                    </div>
                  )
                })
              }
            </div>
          </div>
        </div>
      );
      const recommendedRepairContent = !recommendedRepair.length ? null : (
        <div>
          <div className="card-title"><strong>Services we recommend to be fixed soon</strong></div>
          <div className="card">
            <div className="card-body">
              {
                recommendedRepair.map(item=>{
                  return (
                    <div key={item.id} className="input-group mb-3">
                      <div className="form-control">
                        <span className="inspection-colors good"/>
                        {item.name}
                      </div>
                      <div className="input-group-append">
                        <span className="input-group-text"><strong>${item.price}</strong></span>
                        <div className="input-group-text">
                          <input disabled={selectedQuoteId !== null} type="checkbox"checked={item.checked} onClick={()=>this.issueChecked(item.id)} aria-label="Checkbox for following text input"/>
                        </div>
                      </div>
                    </div>
                  )
                })
              }
            </div>
          </div>
        </div>
      );

      const modalSelectButton = selectedQuoteId !== null ? null : (
        <button data-dismiss="modal" onClick={()=>this.selectQuote(id)} disabled={!totalPrice} type="button" className="btn btn-primary">Repair with {mechanic.name}</button>
      )

      const modalContent = (
        <div className="modal fade bd-example-modal-lg" tabIndex="-1" role="dialog" aria-labelledby="myLargeModalLabel"
             aria-hidden="true">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLongTitle">Quote from {mechanic.name}</h5>
                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <div className="input-group mb-3">
                  <div className="input-group-prepend">
                    <span className="input-group-text">Address</span>
                  </div>
                  <div className="form-control">
                    <strong>{mechanic.address}, {mechanic.city}, {mechanic.state} {mechanic.state} {mechanic.zip}</strong>
                  </div>
                </div>
                <div className="input-group mb-3">
                  <div className="input-group-prepend">
                    <span className="input-group-text">Soonest Available Time</span>
                  </div>
                  <div className="form-control">
                    <strong>{soonestAvailableDateTime}</strong>
                  </div>
                </div>
                <div className="input-group mb-3">
                  <div className="input-group-prepend">
                    <span className="input-group-text">Estimated Completion Time</span>
                  </div>
                  <div className="form-control">
                    <strong>{estamatedCompletionDateTime}</strong>
                  </div>
                </div>
                { mainRepairContent }
                { urgentRepairContent }
                { recommendedRepairContent }
              </div>
              <div className="modal-footer">
                Total Price:
                <div className="ml-1 btn btn-outline-dark">
                  <strong>${totalPrice}</strong>
                </div>
                {modalSelectButton}
              </div>
            </div>
          </div>
        </div>
      )

      quotesAllContent = (
        <Fragment>
          {modalContent}
          {
            quotes.map((item, ind)=>{
              const { mechanic, repairs, soonestAvailableDateTime, photo, id } =  item;
              let quotedPrice = 0;
              repairs.forEach(rep=>{
                if(rep.isReportedByConsumer){
                  quotedPrice += rep.price
                }
              });
              const seeDetailsBtn = selectedQuoteId === null || selectedQuoteId == id ? (
                <button onClick={()=>this.openQuote(ind)} type="button" className="btn btn-primary" data-toggle="modal"
                        data-target=".bd-example-modal-lg">See Details</button>
              ) : null;
              const isSelectedQuoteUi = selectedQuoteId !== id ? null :(
                <div>Your Selected Mechanic</div>
              );
              const isSelectedClass = selectedQuoteId !== id ? 'card-body' : 'card-body bg-info text-white';
              const mechanicImg = !ind ? MechanicImg1 : ind===1 ? MechanicImg2 : MechanicImg3;
              return (
                <div className="card">
                  <div className={isSelectedClass}>
                    {isSelectedQuoteUi}
                    <div className="card-content img">
                      <img src={mechanicImg} className="card-img-top"/>
                    </div>
                    <div className="card-content">
                      <h5 className="card-title mb-0">{mechanic.name}</h5>
                      <ul className="quotes">
                        <li>{mechanic.address}, {mechanic.city}, {mechanic.state} {mechanic.state} {mechanic.zip} </li>
                        <li>
                          <div className="quote-title">Quoted Price</div>
                          <div className="price">${quotedPrice}</div>
                        </li>
                        <li>
                          <div className="quote-title">Soonest Availability</div>
                          <div className="date">{soonestAvailableDateTime}</div>
                        </li>
                        <li>{seeDetailsBtn}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )
            })
          }
        </Fragment>
      )
    }

    return (
          <div className="diagnostic-content">
            <div className="card-title"><strong>Reported Issue:</strong></div>
            <div className="card">
              <div className="card-body">
                <p className="card-text">{reportedIssue}</p>
              </div>
            </div>
            <div className="card-title"><strong>Root Cause:</strong></div>
            <div className="card">
              <div className="card-body">
                <p className="card-text">{rootCause}</p>
              </div>
            </div>
            <div className="card-title"><strong>Recommendation:</strong></div>
            <div className="card">
              <div className="card-body">
                <p className="card-text">{recommendation}</p>
              </div>
            </div>
            <div className="card-title"><strong>Price Range:</strong></div>
            <div className="card">
              <div className="card-body">
                <p className="card-text">
                  <ul>
                    <li>{pricePartsDescription}: ${pricePartsAmountFrom} - ${pricePartsAmountTo}</li>
                    <li>{priceLaborDescription}: ${priceLaborAmountFrom} - ${priceLaborAmountTo}</li>
                  </ul>
                </p>
              </div>
            </div>
            {/*<div className="card-title"><strong>Photos:</strong></div>*/}
            {/*<div className="card">*/}
              {/*<div className="card-body">*/}
                {/*<p className="card-text">*/}
                  {/*{*/}
                    {/*photos.map(photo=>{*/}
                      {/*<img className="car-pictures" src={photo.url} alt={photo.name} title={photo.name} />*/}
                    {/*})*/}
                  {/*}*/}
                {/*</p>*/}
              {/*</div>*/}
            {/*</div>*/}
            <p>
              <div className="card-title"><strong>Quote from mechanics nearby:</strong></div>
              {quotesAllContent}
            </p>
          </div>
    );
  }
}

export default ReportDiagnostic;
