const supabase = require('../utils/db');
const { extractTextFromPDF } = require('../utils/pdfParser');
const { analyzeContract, calculateRiskScore } = require('../utils/openaiHelper');

const scanContract = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const contractText = await extractTextFromPDF(req.file.buffer);
    if (!contractText || contractText.trim().length < 100) {
      return res.status(400).json({ error: 'Could not extract text from PDF' });
    }
    const scanResults = await analyzeContract(contractText);
    const overallRiskScore = calculateRiskScore(scanResults);

    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .insert([{ user_id: req.userId, filename: req.file.originalname, overall_risk_score: overallRiskScore }])
      .select()
      .single();

    if (contractError) throw contractError;

    for (const result of scanResults) {
      await supabase.from('scan_results').insert([{
        contract_id: contract.id,
        clause_type: result.clause_type,
        risk_level: result.risk_level,
        clause_quote: result.clause_quote,
        explanation: result.explanation
      }]);
    }

    res.json({ contract, results: scanResults, overallRiskScore });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

const getContracts = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getContractById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: contract, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.userId)
      .single();

    if (error || !contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    const { data: results } = await supabase
      .from('scan_results')
      .select('*')
      .eq('contract_id', id);

    res.json({ contract, results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { scanContract, getContracts, getContractById };